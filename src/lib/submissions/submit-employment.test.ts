import { describe, it, expect } from "vitest";
import { submitEmployment } from "./submit-employment";
import { createInMemoryEmploymentRepository } from "./employment-repository";
import { createInMemoryRateLimiter } from "./rate-limiter";
import { decryptPII } from "@/lib/pii-crypto";

const KEY = "test-employment-key-32-chars-long!!";

function makeDeps() {
  const repository = createInMemoryEmploymentRepository();
  const sent: unknown[] = [];
  const emailer = {
    async notifyEmployment(p: unknown) {
      sent.push(p);
    },
  };
  const rateLimiter = createInMemoryRateLimiter({
    max: 3,
    windowSeconds: 60,
  });
  return { repository, emailer, rateLimiter, encryptionKey: KEY, sent };
}

const validPayload = {
  firstName: "Alex",
  lastName: "Doe",
  dob: "1990-01-15",
  phone: "555-123-4567",
  email: "alex@example.com",
  mailingAddress: "123 Any Street, Ardmore OK 73401",
  isUsCitizen: "yes",
  hasFelony: "no",
  education: "high_school",
  arrestsDisclosure: "NONE",
  certifiedTruthful: "on",
};

describe("submitEmployment", () => {
  it("rejects when certification checkbox is missing", async () => {
    const deps = makeDeps();
    const res = await submitEmployment(deps, {
      payload: { ...validPayload, certifiedTruthful: "" },
      ip: "1.1.1.1",
    });
    expect(res.error?.code).toBe("invalid_input");
    expect(res.error?.fields?.certifiedTruthful).toBeDefined();
    expect(deps.repository.rows).toHaveLength(0);
  });

  it("requires a felony explanation when hasFelony = yes", async () => {
    const deps = makeDeps();
    const res = await submitEmployment(deps, {
      payload: { ...validPayload, hasFelony: "yes" },
      ip: "1.1.1.1",
    });
    expect(res.error?.code).toBe("invalid_input");
    expect(res.error?.fields?.felonyExplanation).toBeDefined();
  });

  it("requires work authorization when not a US citizen", async () => {
    const deps = makeDeps();
    const res = await submitEmployment(deps, {
      payload: { ...validPayload, isUsCitizen: "no" },
      ip: "1.1.1.1",
    });
    expect(res.error?.code).toBe("invalid_input");
    expect(res.error?.fields?.isAuthorizedToWork).toBeDefined();
  });

  it("encrypts DOB + felony + arrests before persisting", async () => {
    const deps = makeDeps();
    const res = await submitEmployment(deps, {
      payload: { ...validPayload, arrestsDisclosure: "Arrested once in 2015." },
      ip: "1.1.1.1",
    });
    expect(res.error).toBeNull();
    const row = deps.repository.rows[0];
    // Plaintext never appears as-is in the persisted row.
    expect(row.dobEncrypted).not.toContain(validPayload.dob);
    expect(row.arrestsDisclosureEncrypted).not.toContain("2015");
    expect(row.hasFelonyEncrypted).not.toBe("no");
    // Round-trip decrypts back to the original values.
    expect(decryptPII(row.dobEncrypted, KEY)).toBe("1990-01-15");
    expect(decryptPII(row.hasFelonyEncrypted, KEY)).toBe("no");
    expect(decryptPII(row.arrestsDisclosureEncrypted, KEY)).toBe(
      "Arrested once in 2015.",
    );
  });

  it("sends only non-sensitive preview fields to the emailer", async () => {
    const deps = makeDeps();
    await submitEmployment(deps, { payload: validPayload, ip: "1.1.1.1" });
    const preview = deps.sent[0] as Record<string, unknown>;
    expect(preview.firstName).toBe("Alex");
    expect(preview.phone).toBe("555-123-4567");
    expect(preview).not.toHaveProperty("dob");
    expect(preview).not.toHaveProperty("dobEncrypted");
    expect(preview).not.toHaveProperty("arrestsDisclosure");
    expect(preview).not.toHaveProperty("hasFelony");
  });

  it("rate-limits by IP", async () => {
    const deps = makeDeps();
    for (let i = 0; i < 3; i++) {
      await submitEmployment(deps, { payload: validPayload, ip: "2.2.2.2" });
    }
    const blocked = await submitEmployment(deps, {
      payload: validPayload,
      ip: "2.2.2.2",
    });
    expect(blocked.error?.code).toBe("rate_limited");
  });

  it("refuses to run without an encryption key", async () => {
    const deps = { ...makeDeps(), encryptionKey: "" };
    await expect(
      submitEmployment(deps, { payload: validPayload, ip: "1.1.1.1" }),
    ).rejects.toThrow(/key/i);
  });
});

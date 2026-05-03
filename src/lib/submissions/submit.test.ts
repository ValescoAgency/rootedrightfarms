import { describe, it, expect } from "vitest";
import { submitContact } from "./submit";
import { createInMemorySubmissionsRepository } from "./repository";
import { createNoopEmailer } from "./emailer";
import { createInMemoryRateLimiter } from "./rate-limiter";

function makeDeps() {
  const repository = createInMemorySubmissionsRepository();
  const emailer = createNoopEmailer();
  const rateLimiter = createInMemoryRateLimiter({
    max: 2,
    windowSeconds: 60,
  });
  return { repository, emailer, rateLimiter };
}

const validPayload = {
  inquiryType: "wholesale",
  name: "Alex Buyer",
  email: "alex@shop.com",
  phone: "",
  company: "Shop",
  licenseNumber: "",
  address: "",
  message: "Tell me about Pie Hoe availability next month please.",
};

describe("submitContact", () => {
  it("rejects an invalid email with a field-keyed error", async () => {
    const deps = makeDeps();
    const res = await submitContact(deps, {
      payload: { ...validPayload, email: "not-an-email" },
      ip: "1.1.1.1",
    });
    expect(res.error?.code).toBe("invalid_input");
    expect(res.error?.fields?.email).toMatch(/valid email/i);
    expect(deps.repository.rows).toHaveLength(0);
    expect(deps.emailer.sent).toHaveLength(0);
  });

  it("requires licenseNumber + address for dispensary-registration", async () => {
    const deps = makeDeps();
    const res = await submitContact(deps, {
      payload: { ...validPayload, inquiryType: "dispensary-registration" },
      ip: "1.1.1.1",
    });
    expect(res.error?.code).toBe("invalid_input");
    expect(res.error?.fields?.licenseNumber).toMatch(/license/i);
    expect(res.error?.fields?.address).toMatch(/address/i);
  });

  it("persists a valid submission and triggers the emailer", async () => {
    const deps = makeDeps();
    const res = await submitContact(deps, {
      payload: validPayload,
      ip: "1.1.1.1",
    });
    expect(res.error).toBeNull();
    expect(res.data?.name).toBe("Alex Buyer");
    expect(deps.repository.rows).toHaveLength(1);
    expect(deps.emailer.sent).toHaveLength(1);
    expect(deps.emailer.sent[0].id).toBe(res.data?.id);
  });

  it("returns a rate_limited error once the window fills", async () => {
    const deps = makeDeps(); // max 2
    await submitContact(deps, { payload: validPayload, ip: "2.2.2.2" });
    await submitContact(deps, { payload: validPayload, ip: "2.2.2.2" });
    const third = await submitContact(deps, {
      payload: validPayload,
      ip: "2.2.2.2",
    });
    expect(third.error?.code).toBe("rate_limited");
    expect(deps.repository.rows).toHaveLength(2);
  });

  it("doesn't surface emailer failures to the caller", async () => {
    const deps = makeDeps();
    const broken = {
      sent: [] as unknown[],
      async notifyContact() {
        throw new Error("smtp down");
      },
    };
    const res = await submitContact(
      { ...deps, emailer: broken },
      { payload: validPayload, ip: "3.3.3.3" },
    );
    expect(res.error).toBeNull();
    expect(res.data?.id).toBeDefined();
  });
});

import { describe, it, expect, vi } from "vitest";
import { subscribeEmail } from "./subscribe";
import { createInMemoryNewsletterRepository } from "./repository";
import { createInMemoryRateLimiter } from "@/lib/submissions/rate-limiter";
import type { NewsletterProvider } from "./provider";

function fakeProvider(
  overrides: Partial<NewsletterProvider> = {},
): NewsletterProvider & { calls: string[] } {
  const calls: string[] = [];
  return {
    calls,
    async addContact(email) {
      calls.push(email);
      return { contactId: `rsnd-${email}` };
    },
    ...overrides,
  };
}

function makeDeps(providerOverride?: Partial<NewsletterProvider>) {
  const repository = createInMemoryNewsletterRepository();
  const provider = fakeProvider(providerOverride);
  const rateLimiter = createInMemoryRateLimiter({ max: 5, windowSeconds: 60 });
  return { repository, provider, rateLimiter, delay: async () => {} };
}

describe("subscribeEmail", () => {
  it("rejects an invalid email", async () => {
    const deps = makeDeps();
    const res = await subscribeEmail(deps, { email: "nope", ip: "1.1.1.1" });
    expect(res.error?.code).toBe("invalid_email");
    expect(deps.repository.rows).toHaveLength(0);
    expect(deps.provider.calls).toHaveLength(0);
  });

  it("normalizes email (trim + lowercase)", async () => {
    const deps = makeDeps();
    await subscribeEmail(deps, { email: "  Alex@SHOP.com ", ip: "1.1.1.1" });
    expect(deps.repository.rows[0].email).toBe("alex@shop.com");
  });

  it("persists a new subscriber and syncs to the provider", async () => {
    const deps = makeDeps();
    const res = await subscribeEmail(deps, {
      email: "alex@shop.com",
      ip: "1.1.1.1",
    });
    expect(res.error).toBeNull();
    expect(res.data?.alreadySubscribed).toBe(false);
    expect(deps.repository.rows[0].resendContactId).toBe("rsnd-alex@shop.com");
    expect(deps.provider.calls).toEqual(["alex@shop.com"]);
  });

  it("is idempotent on duplicate email (no second provider sync)", async () => {
    const deps = makeDeps();
    await subscribeEmail(deps, { email: "a@b.com", ip: "1.1.1.1" });
    await subscribeEmail(deps, { email: "a@b.com", ip: "1.1.1.1" });
    expect(deps.repository.rows).toHaveLength(1);
    expect(deps.provider.calls).toEqual(["a@b.com"]); // only first sync
  });

  it("retries once on transient provider failure", async () => {
    let attempts = 0;
    const deps = makeDeps({
      async addContact(email) {
        attempts += 1;
        if (attempts === 1) throw new Error("transient 5xx");
        return { contactId: `ok-${email}` };
      },
    });
    const res = await subscribeEmail(deps, {
      email: "retry@b.com",
      ip: "1.1.1.1",
    });
    expect(res.error).toBeNull();
    expect(attempts).toBe(2);
    expect(deps.repository.rows[0].resendContactId).toBe("ok-retry@b.com");
  });

  it("persists the row even if the provider fails twice", async () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const deps = makeDeps({
      async addContact() {
        throw new Error("persistent 5xx");
      },
    });
    const res = await subscribeEmail(deps, {
      email: "loss@b.com",
      ip: "1.1.1.1",
    });
    expect(res.error).toBeNull(); // user sees success
    expect(deps.repository.rows).toHaveLength(1);
    expect(deps.repository.rows[0].resendContactId).toBeNull();
    expect(errSpy).toHaveBeenCalled();
    errSpy.mockRestore();
    warnSpy.mockRestore();
  });

  it("rate-limits by IP", async () => {
    const deps = makeDeps();
    // Burn the window (max 5 in makeDeps)
    for (let i = 0; i < 5; i++) {
      await subscribeEmail(deps, { email: `u${i}@b.com`, ip: "7.7.7.7" });
    }
    const blocked = await subscribeEmail(deps, {
      email: "over@b.com",
      ip: "7.7.7.7",
    });
    expect(blocked.error?.code).toBe("rate_limited");
  });
});

import { z } from "zod";
import type { NewsletterProvider } from "./provider";
import type { NewsletterRepository } from "./repository";
import type { RateLimiter } from "@/lib/submissions/rate-limiter";
import type { SubscribeEnvelope } from "./types";

const emailSchema = z.string().trim().toLowerCase().email();

export interface SubscribeDeps {
  repository: NewsletterRepository;
  provider: NewsletterProvider;
  rateLimiter: RateLimiter;
  /** Callable used to schedule the single retry — swappable for tests. */
  delay?: (ms: number) => Promise<void>;
}

export interface SubscribeRequest {
  email: unknown;
  ip: string;
  source?: string;
}

const RETRY_DELAY_MS = 400;

export async function subscribeEmail(
  deps: SubscribeDeps,
  req: SubscribeRequest,
): Promise<SubscribeEnvelope> {
  const parsed = emailSchema.safeParse(req.email);
  if (!parsed.success) {
    return {
      data: null,
      error: { code: "invalid_email", message: "Enter a valid email." },
    };
  }

  const rate = deps.rateLimiter.check(req.ip);
  if (!rate.allowed) {
    return {
      data: null,
      error: {
        code: "rate_limited",
        message: `Too many attempts. Try again in ${rate.retryAfterSeconds}s.`,
      },
    };
  }

  const { subscriber, alreadyExisted } = await deps.repository.upsertByEmail(
    parsed.data,
    req.source ?? null,
  );

  // If the row already had a provider contact id we're fully synced.
  if (alreadyExisted && subscriber.resendContactId) {
    return { data: { alreadySubscribed: true }, error: null };
  }

  // Sync to provider with a single retry on transient failure. We treat ANY
  // throw as transient — the provider decides whether it was actually a 5xx.
  // Provider failures never leak to the user; the DB row is persisted either
  // way so we can back-fill via a reconciliation job later.
  try {
    const { contactId } = await deps.provider.addContact(subscriber.email);
    await deps.repository.setResendContactId(subscriber.id, contactId);
  } catch (firstErr) {
    console.warn("[newsletter] provider sync failed, retrying once", firstErr);
    const delay = deps.delay ?? defaultDelay;
    await delay(RETRY_DELAY_MS);
    try {
      const { contactId } = await deps.provider.addContact(subscriber.email);
      await deps.repository.setResendContactId(subscriber.id, contactId);
    } catch (secondErr) {
      console.error(
        "[newsletter] provider sync failed after retry; row persisted unsynced",
        secondErr,
      );
    }
  }

  return {
    data: { alreadySubscribed: alreadyExisted },
    error: null,
  };
}

function defaultDelay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

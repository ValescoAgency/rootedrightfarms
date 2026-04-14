import { contactSubmissionSchema } from "./schema";
import type { SubmissionsRepository, PersistedSubmission } from "./repository";
import type { SubmissionEmailer } from "./emailer";
import type { RateLimiter } from "./rate-limiter";
import type { Envelope } from "./types";

export interface SubmitContactDeps {
  repository: SubmissionsRepository;
  emailer: SubmissionEmailer;
  rateLimiter: RateLimiter;
}

export interface SubmitContactRequest {
  payload: unknown;
  ip: string;
  userAgent?: string;
}

/**
 * Pure submit function — takes injected deps so it is trivial to unit-test.
 * The server action wrapper at src/app/contact/actions.ts supplies the real
 * Supabase + Resend + rate-limiter implementations.
 */
export async function submitContact(
  deps: SubmitContactDeps,
  req: SubmitContactRequest,
): Promise<Envelope<PersistedSubmission>> {
  const parsed = contactSubmissionSchema.safeParse(req.payload);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "_form";
      if (!(key in fields)) fields[key] = issue.message;
    }
    return {
      data: null,
      error: { code: "invalid_input", message: "Please fix the fields below.", fields },
    };
  }

  const rate = deps.rateLimiter.check(req.ip);
  if (!rate.allowed) {
    return {
      data: null,
      error: {
        code: "rate_limited",
        message: `Too many submissions. Try again in ${rate.retryAfterSeconds} seconds.`,
      },
    };
  }

  const row = await deps.repository.insertContact(parsed.data, {
    ip: req.ip,
    userAgent: req.userAgent ?? null,
  });

  // Best-effort notification — the user shouldn't see an error if email fails.
  try {
    await deps.emailer.notifyContact(row);
  } catch (err) {
    console.error("[submissions] notifyContact failed", err);
  }

  return { data: row, error: null };
}

import { employmentSubmissionSchema } from "./employment-schema";
import type {
  EmploymentRepository,
  EmploymentRowAtRest,
} from "./employment-repository";
import type { RateLimiter } from "./rate-limiter";
import type { Envelope } from "./types";
import { encryptPII } from "@/lib/pii-crypto";

export interface EmploymentEmailer {
  notifyEmployment(preview: EmploymentNotificationPreview): Promise<void>;
}

export interface EmploymentNotificationPreview {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  submittedAt: string;
}

export interface SubmitEmploymentDeps {
  repository: EmploymentRepository;
  emailer: EmploymentEmailer;
  rateLimiter: RateLimiter;
  encryptionKey: string;
}

export interface SubmitEmploymentRequest {
  payload: unknown;
  ip: string;
}

/**
 * Pure submit for the employment form.
 * Encrypts DOB + felony + explanation + arrests via pii-crypto BEFORE the
 * row reaches the repository, so non-admin DB reads can never see plaintext.
 * The emailer receives only non-sensitive preview fields.
 */
export async function submitEmployment(
  deps: SubmitEmploymentDeps,
  req: SubmitEmploymentRequest,
): Promise<Envelope<EmploymentRowAtRest>> {
  const parsed = employmentSubmissionSchema.safeParse(req.payload);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "_form";
      if (!(key in fields)) fields[key] = issue.message;
    }
    return {
      data: null,
      error: {
        code: "invalid_input",
        message: "Please fix the fields below.",
        fields,
      },
    };
  }

  const rate = deps.rateLimiter.check(req.ip);
  if (!rate.allowed) {
    return {
      data: null,
      error: {
        code: "rate_limited",
        message: `Too many submissions. Try again in ${rate.retryAfterSeconds}s.`,
      },
    };
  }

  const v = parsed.data;
  const enc = (s: string) => encryptPII(s, deps.encryptionKey);

  const row = await deps.repository.insert({
    firstName: v.firstName,
    lastName: v.lastName,
    dobEncrypted: enc(v.dob),
    phone: v.phone,
    email: v.email && v.email.length > 0 ? v.email : null,
    mailingAddress: v.mailingAddress,
    isUsCitizen: v.isUsCitizen === "yes",
    isAuthorizedToWork:
      v.isAuthorizedToWork == null ? null : v.isAuthorizedToWork === "yes",
    hasFelonyEncrypted: enc(v.hasFelony),
    felonyExplanationEncrypted:
      v.felonyExplanation && v.felonyExplanation.length > 0
        ? enc(v.felonyExplanation)
        : null,
    education: v.education,
    militaryService:
      v.militaryService && v.militaryService.length > 0
        ? v.militaryService
        : null,
    arrestsDisclosureEncrypted: enc(v.arrestsDisclosure),
  });

  try {
    await deps.emailer.notifyEmployment({
      id: row.id,
      firstName: row.firstName,
      lastName: row.lastName,
      phone: row.phone,
      email: row.email,
      submittedAt: row.createdAt,
    });
  } catch (err) {
    console.error("[employment] notifyEmployment failed", err);
  }

  return { data: row, error: null };
}

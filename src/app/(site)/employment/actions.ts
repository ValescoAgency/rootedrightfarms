"use server";

import { headers } from "next/headers";
import { submitEmployment } from "@/lib/submissions/submit-employment";
import { getEmploymentRepository } from "@/lib/submissions/supabase-employment-repository";
import {
  createNoopEmploymentEmailer,
  createResendEmploymentEmailer,
} from "@/lib/submissions/employment-emailer";
import { createInMemoryRateLimiter } from "@/lib/submissions/rate-limiter";
import type { Envelope } from "@/lib/submissions/types";
import type { EmploymentRowAtRest } from "@/lib/submissions/employment-repository";

const repository = getEmploymentRepository();
const rateLimiter = createInMemoryRateLimiter({ max: 3, windowSeconds: 60 });

function buildEmailer() {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const to =
    process.env.EMPLOYMENT_NOTIFICATION_TO ??
    process.env.CONTACT_NOTIFICATION_TO;
  if (key && from && to) {
    return createResendEmploymentEmailer({ apiKey: key, from, to });
  }
  return createNoopEmploymentEmailer();
}

const emailer = buildEmailer();

function readIp(h: Awaited<ReturnType<typeof headers>>): string {
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown"
  );
}

export async function submitEmploymentAction(
  _prev: Envelope<EmploymentRowAtRest> | null,
  formData: FormData,
): Promise<Envelope<EmploymentRowAtRest>> {
  const encryptionKey = process.env.PII_ENCRYPTION_KEY ?? "";
  if (!encryptionKey) {
    return {
      data: null,
      error: {
        code: "server_misconfigured",
        message:
          "Employment form is temporarily unavailable. Please email hello@rootedrightfarms.com.",
      },
    };
  }

  const h = await headers();
  const payload = {
    firstName: formData.get("firstName")?.toString() ?? "",
    lastName: formData.get("lastName")?.toString() ?? "",
    dob: formData.get("dob")?.toString() ?? "",
    phone: formData.get("phone")?.toString() ?? "",
    email: formData.get("email")?.toString() ?? "",
    mailingAddress: formData.get("mailingAddress")?.toString() ?? "",
    isUsCitizen: formData.get("isUsCitizen")?.toString() ?? "",
    isAuthorizedToWork:
      formData.get("isAuthorizedToWork")?.toString() || undefined,
    hasFelony: formData.get("hasFelony")?.toString() ?? "",
    felonyExplanation: formData.get("felonyExplanation")?.toString() ?? "",
    education: formData.get("education")?.toString() ?? "",
    militaryService: formData.get("militaryService")?.toString() ?? "",
    arrestsDisclosure: formData.get("arrestsDisclosure")?.toString() ?? "",
    certifiedTruthful: formData.get("certifiedTruthful")?.toString() ?? "",
  };

  return submitEmployment(
    { repository, emailer, rateLimiter, encryptionKey },
    { payload, ip: readIp(h) },
  );
}

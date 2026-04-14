"use server";

import { headers } from "next/headers";
import { submitEmployment } from "@/lib/submissions/submit-employment";
import { createInMemoryEmploymentRepository } from "@/lib/submissions/employment-repository";
import { createInMemoryRateLimiter } from "@/lib/submissions/rate-limiter";
import type { Envelope } from "@/lib/submissions/types";
import type { EmploymentRowAtRest } from "@/lib/submissions/employment-repository";

const repository = createInMemoryEmploymentRepository();
const rateLimiter = createInMemoryRateLimiter({ max: 3, windowSeconds: 60 });

// Notification is intentionally light-touch: only non-sensitive preview
// fields. Full Resend wiring lands when the Supabase-backed repo comes online.
const emailer = {
  async notifyEmployment(preview: {
    id: string;
    firstName: string;
    lastName: string;
  }) {
    console.log(
      `[employment] notify: ${preview.firstName} ${preview.lastName} (${preview.id})`,
    );
  },
};

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

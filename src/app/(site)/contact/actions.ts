"use server";

import { headers } from "next/headers";
import { submitContact } from "@/lib/submissions/submit";
import { getContactRepository } from "@/lib/submissions/supabase-contact-repository";
import {
  createNoopEmailer,
  createResendEmailer,
} from "@/lib/submissions/emailer";
import { createInMemoryRateLimiter } from "@/lib/submissions/rate-limiter";
import type { Envelope } from "@/lib/submissions/types";
import type { PersistedSubmission } from "@/lib/submissions/repository";

const repository = getContactRepository();
const rateLimiter = createInMemoryRateLimiter({ max: 5, windowSeconds: 60 });

function buildEmailer() {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const to = process.env.CONTACT_NOTIFICATION_TO;
  if (key && from && to) {
    return createResendEmailer({ apiKey: key, from, to });
  }
  return createNoopEmailer();
}

function readIp(headerStore: Awaited<ReturnType<typeof headers>>): string {
  return (
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    "unknown"
  );
}

export async function submitContactAction(
  _prev: Envelope<PersistedSubmission> | null,
  formData: FormData,
): Promise<Envelope<PersistedSubmission>> {
  const headerStore = await headers();

  const payload = {
    inquiryType: formData.get("inquiryType")?.toString() ?? "general",
    name: formData.get("name")?.toString() ?? "",
    email: formData.get("email")?.toString() ?? "",
    phone: formData.get("phone")?.toString() ?? "",
    company: formData.get("company")?.toString() ?? "",
    licenseNumber: formData.get("licenseNumber")?.toString() ?? "",
    address: formData.get("address")?.toString() ?? "",
    message: formData.get("message")?.toString() ?? "",
  };

  return submitContact(
    { repository, emailer: buildEmailer(), rateLimiter },
    {
      payload,
      ip: readIp(headerStore),
      userAgent: headerStore.get("user-agent") ?? undefined,
    },
  );
}

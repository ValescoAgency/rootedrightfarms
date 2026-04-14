"use server";

import { headers } from "next/headers";
import { subscribeEmail } from "@/lib/newsletter/subscribe";
import { createInMemoryNewsletterRepository } from "@/lib/newsletter/repository";
import {
  createNoopNewsletterProvider,
  createResendAudiencesProvider,
  type NewsletterProvider,
} from "@/lib/newsletter/provider";
import { createInMemoryRateLimiter } from "@/lib/submissions/rate-limiter";
import type { SubscribeEnvelope } from "@/lib/newsletter/types";

const repository = createInMemoryNewsletterRepository();
const rateLimiter = createInMemoryRateLimiter({ max: 5, windowSeconds: 60 });

function buildProvider(): NewsletterProvider {
  const key = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (key && audienceId) {
    return createResendAudiencesProvider({ apiKey: key, audienceId });
  }
  return createNoopNewsletterProvider();
}

function readIp(h: Awaited<ReturnType<typeof headers>>): string {
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown"
  );
}

export async function subscribeNewsletterAction(
  _prev: SubscribeEnvelope | null,
  formData: FormData,
): Promise<SubscribeEnvelope> {
  const h = await headers();
  return subscribeEmail(
    { repository, provider: buildProvider(), rateLimiter },
    {
      email: formData.get("email"),
      ip: readIp(h),
      source: formData.get("source")?.toString() ?? "footer",
    },
  );
}

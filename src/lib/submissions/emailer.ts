import type { PersistedSubmission } from "./repository";
import { INQUIRY_LABELS } from "./types";

export interface SubmissionEmailer {
  notifyContact(submission: PersistedSubmission): Promise<void>;
}

/**
 * Emailer that records calls but sends nothing. Default when
 * `RESEND_API_KEY` is absent so local development never leaks mail.
 */
export function createNoopEmailer(): SubmissionEmailer & {
  sent: PersistedSubmission[];
} {
  const sent: PersistedSubmission[] = [];
  return {
    sent,
    async notifyContact(sub) {
      sent.push(sub);
    },
  };
}

/**
 * Resend-backed emailer. Lazily imports the SDK so tests + in-memory mode
 * never touch the network.
 */
export function createResendEmailer(params: {
  apiKey: string;
  from: string;
  to: string;
}): SubmissionEmailer {
  return {
    async notifyContact(sub) {
      const { Resend } = await import("resend");
      const client = new Resend(params.apiKey);
      await client.emails.send({
        from: params.from,
        to: params.to,
        subject: `[rootedrightfarms] New ${INQUIRY_LABELS[sub.inquiryType]} inquiry — ${sub.name}`,
        text: renderContactEmail(sub),
      });
    },
  };
}

export function renderContactEmail(sub: PersistedSubmission): string {
  const lines = [
    `New inquiry — ${INQUIRY_LABELS[sub.inquiryType]}`,
    ``,
    `Name:    ${sub.name}`,
    `Email:   ${sub.email}`,
  ];
  if (sub.phone) lines.push(`Phone:   ${sub.phone}`);
  if (sub.company) lines.push(`Company: ${sub.company}`);
  if (sub.licenseNumber) lines.push(`License: ${sub.licenseNumber}`);
  if (sub.address) lines.push(`Address: ${sub.address}`);
  lines.push(``, `Message:`, sub.message, ``, `Submission ID: ${sub.id}`);
  return lines.join("\n");
}

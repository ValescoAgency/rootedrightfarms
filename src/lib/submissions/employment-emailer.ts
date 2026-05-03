import type { EmploymentEmailer } from "./submit-employment";

/**
 * No-op emailer — records calls without sending. Used in tests and when
 * RESEND_API_KEY is absent (local dev, preview deploys without secrets).
 */
export function createNoopEmploymentEmailer(): EmploymentEmailer & {
  sent: unknown[];
} {
  const sent: unknown[] = [];
  return {
    sent,
    async notifyEmployment(preview) {
      sent.push(preview);
    },
  };
}

/**
 * Resend-backed employment notification emailer.
 *
 * Only non-PII preview fields are included in the email — name, phone,
 * email address (if provided), and submission ID. DOB, felony disclosure,
 * and arrests disclosure are never included; those are read via the admin
 * inbox or directly in Supabase.
 *
 * Recipient: CONTACT_NOTIFICATION_TO (same inbox Jeff uses for contact
 * form notifications). Override with EMPLOYMENT_NOTIFICATION_TO if needed.
 */
export function createResendEmploymentEmailer(params: {
  apiKey: string;
  from: string;
  to: string;
}): EmploymentEmailer {
  return {
    async notifyEmployment(preview) {
      const { Resend } = await import("resend");
      const client = new Resend(params.apiKey);
      await client.emails.send({
        from: params.from,
        to: params.to,
        subject: `[rootedrightfarms] New employment application — ${preview.firstName} ${preview.lastName}`,
        text: renderEmploymentEmail(preview),
      });
    },
  };
}

function renderEmploymentEmail(preview: {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  submittedAt: string;
}): string {
  const lines = [
    `New employment application`,
    ``,
    `Name:         ${preview.firstName} ${preview.lastName}`,
    `Phone:        ${preview.phone}`,
  ];
  if (preview.email) lines.push(`Email:        ${preview.email}`);
  lines.push(
    `Submitted:    ${new Date(preview.submittedAt).toLocaleString("en-US", { timeZone: "America/Chicago" })} CT`,
    ``,
    `Submission ID: ${preview.id}`,
    ``,
    `Full application (including sensitive fields) is available in the Supabase dashboard:`,
    `Table: employment_submissions`,
  );
  return lines.join("\n");
}

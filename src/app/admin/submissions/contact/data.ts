import {
  createInMemoryContactInbox,
  type ContactInboxRow,
  type SubmissionStatus,
} from "@/lib/submissions/admin-inbox";
import type { InquiryType } from "@/lib/submissions/types";

// Module-level singleton to survive request-to-request within a single
// process. Swap for a Supabase-backed impl when the service-role repo
// lands.
const inbox = createInMemoryContactInbox();

export async function listContactInbox(filter: {
  status?: SubmissionStatus;
  inquiryType?: InquiryType;
}): Promise<ContactInboxRow[]> {
  return inbox.list(filter);
}

export async function getContactSubmission(id: string) {
  return inbox.get(id);
}

export async function setContactStatus(
  id: string,
  next: SubmissionStatus,
) {
  return inbox.setStatus(id, next);
}

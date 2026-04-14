import type { ContactSubmissionInput } from "./schema";
import type { EmploymentRowAtRest } from "./employment-repository";

export type SubmissionStatus = "new" | "read" | "archived";

export interface ContactInboxRow
  extends ContactSubmissionInput {
  id: string;
  status: SubmissionStatus;
  createdAt: string;
}

export interface EmploymentInboxRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string;
  status: SubmissionStatus;
  createdAt: string;
}

export interface ContactInboxRepository {
  list(filter: {
    status?: SubmissionStatus;
    inquiryType?: ContactSubmissionInput["inquiryType"];
  }): Promise<ContactInboxRow[]>;
  get(id: string): Promise<ContactInboxRow | null>;
  setStatus(id: string, next: SubmissionStatus): Promise<void>;
}

export interface EmploymentInboxRepository {
  list(filter: { status?: SubmissionStatus }): Promise<EmploymentInboxRow[]>;
  /** Returns decrypted record + writes an access log row. */
  openForReview(
    id: string,
    actorUserId: string,
  ): Promise<DecryptedEmployment | null>;
  setStatus(id: string, next: SubmissionStatus): Promise<void>;
}

export interface DecryptedEmployment {
  row: EmploymentInboxRow;
  dob: string;
  hasFelony: "yes" | "no";
  felonyExplanation: string | null;
  arrestsDisclosure: string;
}

/**
 * Pure status-transition guard. new → read → archived → read (unarchive).
 * Returns null when the transition is illegal.
 */
export function nextStatus(
  current: SubmissionStatus,
  action: "markRead" | "archive" | "unarchive",
): SubmissionStatus | null {
  if (action === "markRead" && current === "new") return "read";
  if (action === "archive" && current !== "archived") return "archived";
  if (action === "unarchive" && current === "archived") return "read";
  return null;
}

/**
 * In-memory contact inbox repo. Consumes rows from the same in-memory
 * submissions repository VA-36 uses; shared state is wired via the server
 * action singleton in src/app/admin/submissions/contact/actions.ts once
 * the real Supabase repo is swapped in.
 */
export function createInMemoryContactInbox(
  seed: ContactInboxRow[] = [],
): ContactInboxRepository & { rows: ContactInboxRow[] } {
  const rows = [...seed];
  return {
    rows,
    async list(filter) {
      return rows.filter(
        (r) =>
          (!filter.status || r.status === filter.status) &&
          (!filter.inquiryType || r.inquiryType === filter.inquiryType),
      );
    },
    async get(id) {
      return rows.find((r) => r.id === id) ?? null;
    },
    async setStatus(id, next) {
      const row = rows.find((r) => r.id === id);
      if (row) row.status = next;
    },
  };
}

export function createInMemoryEmploymentInbox(params: {
  rows: EmploymentInboxRow[];
  decrypt: (row: EmploymentRowAtRest) => DecryptedEmployment;
  atRestLookup: (id: string) => EmploymentRowAtRest | null;
  onAccess: (entry: {
    actorUserId: string;
    submissionId: string;
    accessedAt: Date;
  }) => Promise<void>;
}): EmploymentInboxRepository & { rows: EmploymentInboxRow[] } {
  const rows = [...params.rows];
  return {
    rows,
    async list(filter) {
      return rows.filter((r) => !filter.status || r.status === filter.status);
    },
    async openForReview(id, actorUserId) {
      const atRest = params.atRestLookup(id);
      if (!atRest) return null;
      await params.onAccess({
        actorUserId,
        submissionId: id,
        accessedAt: new Date(),
      });
      return params.decrypt(atRest);
    },
    async setStatus(id, next) {
      const row = rows.find((r) => r.id === id);
      if (row) row.status = next;
    },
  };
}

import type { ContactSubmissionInput } from "./schema";

export interface PersistedSubmission extends ContactSubmissionInput {
  id: string;
  createdAt: string;
}

export interface SubmissionsRepository {
  insertContact(
    input: ContactSubmissionInput,
    meta: Record<string, unknown>,
  ): Promise<PersistedSubmission>;
}

/**
 * In-memory repository. Used in unit tests and as a safe no-op fallback when
 * Supabase isn't configured yet. The Supabase-backed implementation is
 * introduced once service-role env vars land in VA-28's Vercel step.
 */
export function createInMemorySubmissionsRepository(): SubmissionsRepository & {
  rows: PersistedSubmission[];
} {
  const rows: PersistedSubmission[] = [];
  return {
    rows,
    async insertContact(input) {
      const row: PersistedSubmission = {
        ...input,
        id: `mem-${rows.length + 1}`,
        createdAt: new Date().toISOString(),
      };
      rows.push(row);
      return row;
    },
  };
}

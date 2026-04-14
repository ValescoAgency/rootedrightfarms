import type { Subscriber } from "./types";

export interface NewsletterRepository {
  /**
   * Insert a subscriber by email. Returns { subscriber, alreadyExisted }.
   * When alreadyExisted is true the resendContactId on the returned row is
   * whatever was previously stored, so callers can skip re-syncing to the
   * provider.
   */
  upsertByEmail(
    email: string,
    source: string | null,
  ): Promise<{ subscriber: Subscriber; alreadyExisted: boolean }>;

  /** Update the Resend contact id once a provider sync succeeds. */
  setResendContactId(subscriberId: string, resendContactId: string): Promise<void>;
}

export function createInMemoryNewsletterRepository(): NewsletterRepository & {
  rows: Subscriber[];
} {
  const rows: Subscriber[] = [];
  return {
    rows,
    async upsertByEmail(email, source) {
      const existing = rows.find((r) => r.email === email);
      if (existing) {
        return { subscriber: existing, alreadyExisted: true };
      }
      const row: Subscriber = {
        id: `mem-${rows.length + 1}`,
        email,
        resendContactId: null,
        source,
        createdAt: new Date().toISOString(),
      };
      rows.push(row);
      return { subscriber: row, alreadyExisted: false };
    },
    async setResendContactId(id, resendContactId) {
      const row = rows.find((r) => r.id === id);
      if (row) row.resendContactId = resendContactId;
    },
  };
}

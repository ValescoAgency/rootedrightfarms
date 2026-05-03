import type { InstagramPost } from "./types";

export interface InstagramRepository {
  /** Public read — homepage grid consumer. */
  listLatest(limit: number): Promise<InstagramPost[]>;

  /**
   * Upsert a batch of posts by ig_post_id. Called by sync-instagram; must
   * be idempotent.
   */
  upsert(posts: Array<Omit<InstagramPost, "id" | "fetchedAt">>): Promise<void>;
}

export function createInMemoryInstagramRepository(
  seed: InstagramPost[] = [],
): InstagramRepository & { rows: InstagramPost[] } {
  const rows: InstagramPost[] = [...seed];
  return {
    rows,
    async listLatest(limit) {
      return [...rows]
        .sort((a, b) => (a.postedAt < b.postedAt ? 1 : -1))
        .slice(0, limit);
    },
    async upsert(posts) {
      const now = new Date().toISOString();
      for (const p of posts) {
        const existing = rows.findIndex((r) => r.igPostId === p.igPostId);
        const row: InstagramPost = {
          id: existing >= 0 ? rows[existing].id : `mem-${rows.length + 1}`,
          fetchedAt: now,
          ...p,
        };
        if (existing >= 0) rows[existing] = row;
        else rows.push(row);
      }
    },
  };
}

export function getInstagramRepository(): InstagramRepository {
  // Swap to a Supabase-backed impl once service-role env vars are wired.
  return createInMemoryInstagramRepository();
}

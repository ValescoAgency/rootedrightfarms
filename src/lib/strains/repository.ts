import type { Strain, ListStrainsOptions, StrainType } from "./types";
import { seedStrains } from "./seed";

export interface StrainRepository {
  listStrains(options?: ListStrainsOptions): Promise<Strain[]>;
  getStrainBySlug(slug: string): Promise<Strain | null>;
  getRelatedStrains(
    type: StrainType,
    excludeSlug: string,
    limit?: number,
  ): Promise<Strain[]>;
}

/**
 * In-memory repository backed by a fixed list. Used for tests and as the
 * fallback catalog before Supabase is wired up in production.
 */
export function createInMemoryStrainRepository(
  strains: Strain[] = seedStrains,
): StrainRepository {
  const published = () => strains.filter((s) => s.isPublished);

  return {
    async listStrains(options) {
      const rows = published();
      if (!options?.type) return rows;
      return rows.filter((s) => s.type === options.type);
    },
    async getStrainBySlug(slug) {
      return published().find((s) => s.slug === slug) ?? null;
    },
    async getRelatedStrains(type, excludeSlug, limit = 3) {
      return published()
        .filter((s) => s.type === type && s.slug !== excludeSlug)
        .slice(0, Math.max(0, limit));
    },
  };
}

/**
 * Entry point used by server components. Supabase-backed implementation is
 * introduced once env vars are wired (VA-28 Vercel step + VA-32 auth). Until
 * then the seed fallback gives the marketing site a deterministic catalog.
 */
export function getStrainRepository(): StrainRepository {
  return createInMemoryStrainRepository();
}

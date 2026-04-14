import type { Strain, ListStrainsOptions, StrainType } from "./types";
import type { StrainAdminInput } from "./admin-schema";
import { seedStrains } from "./seed";
import { createSupabaseStrainRepository } from "./supabase-repository";

export interface GetStrainOptions {
  includeDrafts?: boolean;
}

export interface SaveStrainOptions {
  /**
   * The slug the record was loaded under. When present and different from
   * `input.slug`, the repository renames (UPDATE by originalSlug,
   * SET slug = input.slug). Omit when creating a new record.
   */
  originalSlug?: string;
}

export interface StrainRepository {
  listStrains(
    options?: ListStrainsOptions & GetStrainOptions,
  ): Promise<Strain[]>;
  getStrainBySlug(
    slug: string,
    options?: GetStrainOptions,
  ): Promise<Strain | null>;
  getRelatedStrains(
    type: StrainType,
    excludeSlug: string,
    limit?: number,
  ): Promise<Strain[]>;
  saveStrain(
    input: StrainAdminInput,
    options?: SaveStrainOptions,
  ): Promise<Strain>;
  deleteStrain(slug: string): Promise<void>;
}

/**
 * In-memory repository backed by a mutable list. Used for tests and as the
 * fallback catalog when Supabase env vars are not configured.
 */
export function createInMemoryStrainRepository(
  initial: Strain[] = seedStrains,
): StrainRepository {
  const rows: Strain[] = initial.map((s) => ({ ...s }));
  const filterPublication = (all: Strain[], includeDrafts?: boolean) =>
    includeDrafts ? all : all.filter((s) => s.isPublished);

  return {
    async listStrains(options) {
      let out = filterPublication(rows, options?.includeDrafts);
      if (options?.type) out = out.filter((s) => s.type === options.type);
      return out;
    },
    async getStrainBySlug(slug, options) {
      const match = rows.find((s) => s.slug === slug);
      if (!match) return null;
      if (!options?.includeDrafts && !match.isPublished) return null;
      return match;
    },
    async getRelatedStrains(type, excludeSlug, limit = 3) {
      return rows
        .filter(
          (s) => s.isPublished && s.type === type && s.slug !== excludeSlug,
        )
        .slice(0, Math.max(0, limit));
    },
    async saveStrain(input, options) {
      const originalSlug = options?.originalSlug ?? input.slug;
      const existingIndex = rows.findIndex((s) => s.slug === originalSlug);
      const now = new Date().toISOString();

      if (existingIndex >= 0) {
        const current = rows[existingIndex];
        const next: Strain = {
          ...current,
          ...input,
          galleryImageUrls: current.galleryImageUrls,
          updatedAt: now,
        };
        rows[existingIndex] = next;
        return next;
      }

      const created: Strain = {
        id: `mem-${input.slug}`,
        ...input,
        galleryImageUrls: [],
        createdAt: now,
        updatedAt: now,
      };
      rows.push(created);
      return created;
    },
    async deleteStrain(slug) {
      const idx = rows.findIndex((s) => s.slug === slug);
      if (idx >= 0) rows.splice(idx, 1);
    },
  };
}

function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/**
 * Entry point used by server components and actions. Returns the
 * Supabase-backed repository when env is configured; falls back to the
 * in-memory seed catalog so the marketing site still renders during local
 * dev without Supabase running.
 */
export function getStrainRepository(): StrainRepository {
  return hasSupabaseEnv()
    ? createSupabaseStrainRepository()
    : createInMemoryStrainRepository();
}

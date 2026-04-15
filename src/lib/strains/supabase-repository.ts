import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAnonClient } from "@/lib/supabase/anon";
import type { Strain, StrainType, TiptapDoc } from "./types";
import type { StrainAdminInput } from "./admin-schema";
import type {
  GetStrainOptions,
  SaveStrainOptions,
  StrainRepository,
} from "./repository";

interface StrainRow {
  id: string;
  slug: string;
  name: string;
  type: StrainType;
  thc_pct: number | null;
  cbd_pct: number | null;
  description: unknown;
  lineage: string | null;
  flavors: string[] | null;
  effects: string[] | null;
  hero_image_url: string | null;
  gallery_image_urls: string[] | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Runtime guard: the description column is migrated from text → jsonb.
 * Until the migration is applied, the DB may return a string (old HTML) or
 * a malformed value. Treat anything that isn't a well-formed TipTap doc as
 * null so the page renders without crashing.
 */
function isTiptapDoc(value: unknown): value is TiptapDoc {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as TiptapDoc).type === "doc" &&
    Array.isArray((value as TiptapDoc).content)
  );
}

function rowToStrain(row: StrainRow): Strain {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    type: row.type,
    thcPct: row.thc_pct,
    cbdPct: row.cbd_pct,
    description: isTiptapDoc(row.description) ? row.description : null,
    lineage: row.lineage,
    flavors: row.flavors ?? [],
    effects: row.effects ?? [],
    heroImageUrl: row.hero_image_url,
    galleryImageUrls: row.gallery_image_urls ?? [],
    isPublished: row.is_published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function inputToWrite(input: StrainAdminInput) {
  return {
    slug: input.slug,
    name: input.name,
    type: input.type,
    thc_pct: input.thcPct,
    cbd_pct: input.cbdPct,
    description: input.description,
    lineage: input.lineage,
    flavors: input.flavors,
    effects: input.effects,
    hero_image_url: input.heroImageUrl,
    is_published: input.isPublished,
  };
}

/**
 * Public reads use the cookie-free anon client so they stay callable at
 * build-time (generateStaticParams, ISR) and from pages that don't need
 * the current user's session. The select_strains_public RLS policy
 * surfaces only published rows to the `anon` role.
 */
function publicClient(): SupabaseClient {
  return createSupabaseAnonClient();
}

/**
 * Admin reads (drafts) and all writes use the cookie-aware server client
 * so auth.uid() resolves to the signed-in user. RLS (see
 * 20260414000010) gates admin behavior against public.user_roles.
 */
async function authClient(): Promise<SupabaseClient> {
  // The ssr client is a superset of the js client for our purposes.
  return (await createSupabaseServerClient()) as unknown as SupabaseClient;
}

export function createSupabaseStrainRepository(): StrainRepository {
  return {
    async listStrains(options) {
      const includeDrafts = Boolean(options?.includeDrafts);
      const supabase = includeDrafts ? await authClient() : publicClient();
      let query = supabase.from("strains").select("*");
      if (!includeDrafts) query = query.eq("is_published", true);
      if (options?.type) query = query.eq("type", options.type);
      query = query.order("updated_at", { ascending: false });
      const { data, error } = await query;
      if (error) throw new Error(`listStrains failed: ${error.message}`);
      return (data ?? []).map((r) => rowToStrain(r as StrainRow));
    },

    async getStrainBySlug(slug, options: GetStrainOptions = {}) {
      const includeDrafts = Boolean(options.includeDrafts);
      const supabase = includeDrafts ? await authClient() : publicClient();
      let query = supabase
        .from("strains")
        .select("*")
        .eq("slug", slug)
        .limit(1);
      if (!includeDrafts) query = query.eq("is_published", true);
      const { data, error } = await query.maybeSingle();
      if (error && error.code !== "PGRST116") {
        throw new Error(`getStrainBySlug failed: ${error.message}`);
      }
      return data ? rowToStrain(data as StrainRow) : null;
    },

    async getRelatedStrains(type, excludeSlug, limit = 3) {
      const supabase = publicClient();
      const { data, error } = await supabase
        .from("strains")
        .select("*")
        .eq("type", type)
        .eq("is_published", true)
        .neq("slug", excludeSlug)
        .limit(limit);
      if (error) throw new Error(`getRelatedStrains failed: ${error.message}`);
      return (data ?? []).map((r) => rowToStrain(r as StrainRow));
    },

    async saveStrain(input, options: SaveStrainOptions = {}) {
      const supabase = await authClient();
      const write = inputToWrite(input);
      const originalSlug = options.originalSlug;

      if (originalSlug) {
        const { data, error } = await supabase
          .from("strains")
          .update(write)
          .eq("slug", originalSlug)
          .select("*")
          .single();
        if (error) throw new Error(`saveStrain update failed: ${error.message}`);
        return rowToStrain(data as StrainRow);
      }

      const { data, error } = await supabase
        .from("strains")
        .insert(write)
        .select("*")
        .single();
      if (error) throw new Error(`saveStrain insert failed: ${error.message}`);
      return rowToStrain(data as StrainRow);
    },

    async deleteStrain(slug) {
      const supabase = await authClient();
      const { error } = await supabase.from("strains").delete().eq("slug", slug);
      if (error) throw new Error(`deleteStrain failed: ${error.message}`);
    },
  };
}

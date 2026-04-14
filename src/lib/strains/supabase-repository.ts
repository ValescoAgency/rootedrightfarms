import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Strain, StrainType } from "./types";
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
  description: string | null;
  lineage: string | null;
  flavors: string[] | null;
  effects: string[] | null;
  hero_image_url: string | null;
  gallery_image_urls: string[] | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

function rowToStrain(row: StrainRow): Strain {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    type: row.type,
    thcPct: row.thc_pct,
    cbdPct: row.cbd_pct,
    description: row.description,
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

export function createSupabaseStrainRepository(): StrainRepository {
  return {
    async listStrains(options) {
      const supabase = await createSupabaseServerClient();
      let query = supabase.from("strains").select("*");
      if (!options?.includeDrafts) query = query.eq("is_published", true);
      if (options?.type) query = query.eq("type", options.type);
      query = query.order("updated_at", { ascending: false });
      const { data, error } = await query;
      if (error) throw new Error(`listStrains failed: ${error.message}`);
      return (data ?? []).map((r) => rowToStrain(r as StrainRow));
    },

    async getStrainBySlug(slug, options: GetStrainOptions = {}) {
      const supabase = await createSupabaseServerClient();
      let query = supabase
        .from("strains")
        .select("*")
        .eq("slug", slug)
        .limit(1);
      if (!options.includeDrafts) query = query.eq("is_published", true);
      const { data, error } = await query.maybeSingle();
      if (error && error.code !== "PGRST116") {
        throw new Error(`getStrainBySlug failed: ${error.message}`);
      }
      return data ? rowToStrain(data as StrainRow) : null;
    },

    async getRelatedStrains(type, excludeSlug, limit = 3) {
      const supabase = await createSupabaseServerClient();
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
      const supabase = await createSupabaseServerClient();
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
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase.from("strains").delete().eq("slug", slug);
      if (error) throw new Error(`deleteStrain failed: ${error.message}`);
    },
  };
}

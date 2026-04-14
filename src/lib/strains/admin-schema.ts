import { z } from "zod";
import { STRAIN_TYPES } from "./types";

const CHIP_MAX = 12;

function csvToArray(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, CHIP_MAX);
}

export const strainAdminSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, "lowercase + hyphens only"),
  name: z.string().trim().min(2).max(120),
  type: z.enum(STRAIN_TYPES),
  thcPct: z.number().min(0).max(100).nullable(),
  cbdPct: z.number().min(0).max(100).nullable(),
  description: z.string().trim().max(4000).nullable(),
  lineage: z.string().trim().max(200).nullable(),
  flavors: z.array(z.string().trim().min(1).max(40)).max(CHIP_MAX),
  effects: z.array(z.string().trim().min(1).max(40)).max(CHIP_MAX),
  heroImageUrl: z
    .string()
    .trim()
    .max(1000)
    .refine(
      (v) => v.startsWith("/") || /^https?:\/\//i.test(v),
      {
        message:
          "Must be a full URL (https://…) or a site-relative path (/images/…)",
      },
    )
    .nullable(),
  isPublished: z.boolean(),
});

export type StrainAdminInput = z.infer<typeof strainAdminSchema>;

/**
 * Coerce FormData values (everything arrives as strings) into the typed
 * payload that strainAdminSchema parses. Returns the raw shape so Zod
 * can emit per-field errors.
 */
export function parseStrainFormData(fd: FormData) {
  const get = (key: string) => fd.get(key)?.toString() ?? "";
  return {
    slug: get("slug"),
    name: get("name"),
    type: get("type"),
    thcPct: get("thcPct") ? Number(get("thcPct")) : null,
    cbdPct: get("cbdPct") ? Number(get("cbdPct")) : null,
    description: get("description") || null,
    lineage: get("lineage") || null,
    flavors: csvToArray(get("flavors")),
    effects: csvToArray(get("effects")),
    heroImageUrl: get("heroImageUrl") || null,
    isPublished: get("isPublished") === "on",
  };
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 80);
}

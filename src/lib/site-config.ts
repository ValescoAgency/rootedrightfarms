import { z } from "zod";
import rawConfig from "@/config/site.json";

const trustBarIcon = z.enum([
  "shield",
  "leaf",
  "badge-check",
  "flask",
  "clock",
]);

const siteConfigSchema = z.object({
  hero: z.object({
    tagline: z.string().min(1),
    subtitle: z.string().min(1),
  }),
  contact: z.object({
    email: z.string().email(),
    phone: z.string(),
    address: z.object({
      street: z.string(),
      city: z.string().min(1),
      state: z.string().length(2),
      postalCode: z.string(),
    }),
    replyWindow: z.string().min(1),
  }),
  social: z.object({
    instagram: z.string(),
    facebook: z.string(),
  }),
  trustBar: z
    .array(
      z.object({
        key: z.string().min(1),
        label: z.string().min(1),
        icon: trustBarIcon,
      }),
    )
    .min(1),
  copyright: z.object({
    year: z.number().int().gte(2024).lte(2100),
    licenseText: z.string().min(1),
  }),
});

export type SiteConfig = z.infer<typeof siteConfigSchema>;

/**
 * Parse a raw config blob. Exported for tests; app code should use
 * `getSiteConfig()` which caches the import of site.json.
 */
export function parseSiteConfig(raw: unknown): SiteConfig {
  const result = siteConfigSchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  • ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new Error(
      `Invalid src/config/site.json — schema mismatch:\n${issues}`,
    );
  }
  return result.data;
}

let cached: SiteConfig | null = null;

export function getSiteConfig(): SiteConfig {
  if (!cached) cached = parseSiteConfig(rawConfig);
  return cached;
}

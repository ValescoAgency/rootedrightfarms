/**
 * Resolve the absolute base URL of the deployed site. Vercel sets
 * VERCEL_PROJECT_PRODUCTION_URL + NEXT_PUBLIC_SITE_URL is preferred;
 * local dev falls back to localhost.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

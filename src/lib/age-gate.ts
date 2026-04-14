export const AGE_COOKIE = "rrf_age_verified";
export const AGE_COOKIE_MAX_AGE_DAYS = 30;
export const AGE_COOKIE_MAX_AGE_SECONDS = AGE_COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;

const EXEMPT_EXACT = new Set<string>([
  "/age-check",
  "/age-blocked",
  "/privacy",
  "/terms",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
]);

const EXEMPT_PREFIXES = ["/_next/", "/api/"];

const STATIC_ASSET_EXT =
  /\.(svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|map|woff2?|ttf|eot|mp4|webm|txt|xml|json)$/i;

export function isExemptPath(pathname: string): boolean {
  if (EXEMPT_EXACT.has(pathname)) return true;
  if (EXEMPT_PREFIXES.some((p) => pathname.startsWith(p))) return true;
  if (STATIC_ASSET_EXT.test(pathname)) return true;
  return false;
}

export function buildAgeCheckUrl(originalUrl: URL): URL {
  const target = new URL("/age-check", originalUrl);
  const next = originalUrl.pathname + originalUrl.search;
  if (next && next !== "/") {
    target.searchParams.set("next", next);
  }
  return target;
}

export function sanitizeNextParam(next: string | null | undefined): string {
  if (!next) return "/";
  // Only allow same-origin, absolute paths to avoid open-redirect.
  if (!next.startsWith("/") || next.startsWith("//")) return "/";
  if (next.startsWith("/age-check") || next.startsWith("/age-blocked")) return "/";
  return next;
}

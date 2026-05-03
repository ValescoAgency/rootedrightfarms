-- Resync canonical strain hero_image_url paths.
--
-- PR #27 (feat(strains): real photos + Shopify-style image zoom on detail)
-- consolidated 12 breakpoint-suffixed placeholder files
-- (`/images/strains/<slug>-card-desktop.jpg`, `-card-mobile.jpg`, plus the
-- `/images/strains/detail-hero-*.jpg` pair) into 4 canonical slug-based
-- photos (`/images/strains/<slug>.jpg`) and removed the old files.
--
-- The original seed migration (20260414000002) is `on conflict (slug) do
-- nothing`, so environments seeded before PR #27 — or touched via the
-- admin editor in the interim — still point `hero_image_url` at paths
-- that no longer exist in `public/`. The Vercel preview's strain cards
-- render broken images, and the Playwright image guard
-- (`e2e/images.spec.ts`) flags it.
--
-- This is a forward-only data fix for the 4 canonical slugs. Strains
-- added since via admin (with Supabase-Storage URLs or external hosts)
-- are untouched — the `where` clause only updates rows where the current
-- value matches one of the known-broken legacy paths. Safe to re-run.
update public.strains
set hero_image_url = '/images/strains/' || slug || '.jpg'
where slug in ('pie-hoe', 'banana-candy', 'pine-bud', 'tropicana-cookies')
  and (
    hero_image_url is null
    or hero_image_url like '/images/strains/%-card-desktop.jpg'
    or hero_image_url like '/images/strains/%-card-mobile.jpg'
    or hero_image_url like '/images/strains/detail-hero-%'
  );

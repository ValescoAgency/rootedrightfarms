import { test, expect } from "@playwright/test";

// Guard against regressions where we ship a broken `/images/...` path or an
// image that fails to decode. Instagram thumbnails are intentionally skipped —
// they depend on the Graph API and are covered once that wiring lands.

// Generous wait — Vercel preview cold starts + CI network can easily push
// initial image decode past the Playwright 5s action default.
const IMG_WAIT = 20_000;

test.beforeEach(async ({ context }) => {
  // Bypass the age gate so we land on the real page under test. `url` here
  // both sets the cookie domain and lets Playwright figure out whether it
  // should be marked Secure (needed for https preview URLs).
  await context.addCookies([
    {
      name: "rrf_age_verified",
      value: "1",
      url: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    },
  ]);
});

async function scrollThroughPage(page: import("@playwright/test").Page) {
  await page.evaluate(async () => {
    const step = Math.max(200, Math.floor(window.innerHeight / 2));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 150));
    }
    await new Promise((r) => setTimeout(r, 300));
    window.scrollTo(0, 0);
  });
}

/**
 * Resolves when every <img> matching the selector has loaded
 * (`naturalWidth > 0`). Uses `naturalWidth` rather than layout metrics so
 * the check survives responsive variants that are `display: none` at the
 * current breakpoint — the browser still fetches and decodes them, so a
 * broken path or a failed decode shows up either way.
 */
async function waitForAllImagesLoaded(
  page: import("@playwright/test").Page,
  selector: string,
  { min = 1 }: { min?: number } = {},
) {
  await page.waitForFunction(
    ({ sel, min }) => {
      const imgs = Array.from(document.querySelectorAll<HTMLImageElement>(sel));
      if (imgs.length < min) return false;
      return imgs.every((img) => img.complete && img.naturalWidth > 0);
    },
    { sel: selector, min },
    { timeout: IMG_WAIT },
  );
}

async function waitForAnyImageLoaded(
  page: import("@playwright/test").Page,
  selector: string,
) {
  await page.waitForFunction(
    (sel) => {
      const imgs = Array.from(document.querySelectorAll<HTMLImageElement>(sel));
      return imgs.some((img) => img.complete && img.naturalWidth > 0);
    },
    selector,
    { timeout: IMG_WAIT },
  );
}

test("home page hero + featured strain images render", async ({ page }) => {
  await page.goto("/");
  await scrollThroughPage(page);

  // Hero: at least one of the two responsive <Image fill> variants must load.
  await waitForAnyImageLoaded(page, 'section[aria-label="Hero"] img');

  // Featured strains: at least one card must render with a bud photo. We
  // don't pin a count — the Vercel preview reads from Supabase, which may
  // differ from the in-memory seed (4 strains) over time.
  const strainImgs = page.locator(
    'section[aria-label="Featured strains"] ul li img',
  );
  await expect
    .poll(async () => await strainImgs.count(), { timeout: IMG_WAIT })
    .toBeGreaterThan(0);
  await waitForAllImagesLoaded(
    page,
    'section[aria-label="Featured strains"] ul li img',
  );
});

test("strains catalog page renders hero + every card image", async ({ page }) => {
  await page.goto("/strains");
  await scrollThroughPage(page);

  // Hero image at top of the page. Next Image encodes the source path into
  // `/_next/image?url=…%2Fstrains-hero%2F…`, so we match both attrs.
  await waitForAnyImageLoaded(
    page,
    'img[src*="strains-hero"], img[srcset*="strains-hero"]',
  );

  // Strain cards: natural size > 0 for every one that renders. The list
  // length depends on what Supabase returns — "no broken images" is the
  // guarantee, not a fixed count.
  const cardImgs = page.locator("ul li img");
  await expect
    .poll(async () => await cardImgs.count(), { timeout: IMG_WAIT })
    .toBeGreaterThan(0);
  await waitForAllImagesLoaded(page, "ul li img");
});

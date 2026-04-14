import { test, expect } from "@playwright/test";

// Guard against regressions where we ship a broken `/images/...` path or an
// image that fails to decode. Instagram thumbnails are intentionally skipped —
// they depend on the Graph API and are covered once that wiring lands.

test.beforeEach(async ({ context }) => {
  // Bypass the age gate so we land on the real page under test.
  await context.addCookies([
    {
      name: "rrf_age_verified",
      value: "1",
      url: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    },
  ]);
});

async function waitForAllImagesLoaded(
  page: import("@playwright/test").Page,
  selector: string,
) {
  await page.waitForFunction((sel) => {
    const imgs = Array.from(document.querySelectorAll<HTMLImageElement>(sel));
    if (imgs.length === 0) return false;
    // Only count images that are actually laid out (skips responsive variants
    // hidden via `display: none` at the current breakpoint).
    const visible = imgs.filter((img) => img.offsetParent !== null);
    if (visible.length === 0) return false;
    return visible.every((img) => img.complete && img.naturalWidth > 0);
  }, selector);
}

async function waitForAnyImageLoaded(
  page: import("@playwright/test").Page,
  selector: string,
) {
  await page.waitForFunction((sel) => {
    const imgs = Array.from(document.querySelectorAll<HTMLImageElement>(sel));
    return imgs.some((img) => img.complete && img.naturalWidth > 0);
  }, selector);
}

test("home page hero + featured strain images render", async ({ page }) => {
  await page.goto("/");

  // Scroll through so lazy / IntersectionObserver-gated content loads.
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 100));
    }
    window.scrollTo(0, 0);
  });

  // Hero: at least one of the two responsive <Image fill> variants must load
  // at the active breakpoint.
  await waitForAnyImageLoaded(page, 'section[aria-label="Hero"] img');

  // Featured strains: four cards, each with a bud photo.
  const strainImgs = page.locator(
    'section[aria-label="Featured strains"] ul li img',
  );
  await expect(strainImgs).toHaveCount(4);
  await waitForAllImagesLoaded(
    page,
    'section[aria-label="Featured strains"] ul li img',
  );
});

test("strains catalog page renders hero + every card image", async ({ page }) => {
  await page.goto("/strains");

  // Scroll slowly through the page so lazy-loaded images (e.g. the
  // wholesale banner at the bottom) actually get requested.
  await page.evaluate(async () => {
    const step = 300;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 200));
    }
    await new Promise((r) => setTimeout(r, 400));
    window.scrollTo(0, 0);
  });

  // Hero image at top of the page (Next Image encodes the source path into
  // `/_next/image?url=…%2Fstrains-hero%2F…`).
  await waitForAnyImageLoaded(
    page,
    'img[src*="strains-hero"], img[srcset*="strains-hero"]',
  );

  // Strain cards: natural size > 0 for every one.
  const cardImgs = page.locator("ul li img");
  await expect.poll(async () => await cardImgs.count()).toBeGreaterThan(0);
  await waitForAllImagesLoaded(page, "ul li img");
});

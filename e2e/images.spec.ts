import { test, expect } from "@playwright/test";

// Guard against regressions where we ship a broken `/images/...` path or an
// image that fails to decode. Instagram thumbnails are intentionally skipped
// (they depend on the Graph API).
//
// The tests run against both a local `pnpm dev` and the Vercel preview; the
// preview may be behind deployment protection (bypassed via
// VERCEL_AUTOMATION_BYPASS_SECRET / extraHTTPHeaders in playwright.config.ts)
// and may be sitting on top of a Supabase that publishes a different strain
// set than the in-memory seed. Keep these assertions defensive.

const IMG_WAIT = 20_000;

test.beforeEach(async ({ context }) => {
  // Bypass the age gate. `url` sets the cookie's domain to the base URL and
  // auto-marks it Secure on https.
  await context.addCookies([
    {
      name: "rrf_age_verified",
      value: "1",
      url: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    },
  ]);
});

async function gotoWithoutAgeGate(
  page: import("@playwright/test").Page,
  path: string,
) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  // If the cookie was dropped for any reason, click through the gate so the
  // rest of the test sees the real page.
  if (/\/age-check(?:$|\?)/.test(page.url())) {
    const yes = page.getByRole("button", { name: /yes.*21/i });
    if (await yes.count()) {
      await yes.first().click();
      await page.waitForURL((u) => !/\/age-check/.test(u.pathname), {
        timeout: IMG_WAIT,
      });
    }
  }
  // Cheap settle: run scroll → wait so ScrollReveal + lazy <img> fire.
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
 * Resolves when every <img> matching the selector has finished loading
 * (`naturalWidth > 0`). Uses `naturalWidth` rather than layout metrics so the
 * check survives responsive variants that are `display: none` at the current
 * breakpoint — the browser still fetches and decodes them, so a broken path
 * or a failed decode shows up either way.
 */
async function waitForAllImagesLoaded(
  page: import("@playwright/test").Page,
  selector: string,
) {
  await page.waitForFunction(
    (sel) => {
      const imgs = Array.from(document.querySelectorAll<HTMLImageElement>(sel));
      if (imgs.length === 0) return false;
      return imgs.every((img) => img.complete && img.naturalWidth > 0);
    },
    selector,
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

test("home page hero renders + any visible strain cards have images", async ({
  page,
}) => {
  await gotoWithoutAgeGate(page, "/");

  // Hero is the non-negotiable — at least one of the two responsive variants
  // must load.
  await waitForAnyImageLoaded(page, 'section[aria-label="Hero"] img');

  // Strain cards are opportunistic: if the repo returns zero strains (e.g.
  // Supabase configured but empty), the catalog section still renders the
  // heading but no cards. In that case there's nothing image-related to check.
  const strainImgs = page.locator(
    'section[aria-label="Featured strains"] ul li img',
  );
  const count = await strainImgs.count();
  if (count > 0) {
    await waitForAllImagesLoaded(
      page,
      'section[aria-label="Featured strains"] ul li img',
    );
  }
});

test("strains catalog page hero renders + any visible cards have images", async ({
  page,
}) => {
  await gotoWithoutAgeGate(page, "/strains");

  // Next Image encodes the source path into `/_next/image?url=…%2Fstrains-hero%2F…`,
  // so we match both attrs.
  await waitForAnyImageLoaded(
    page,
    'img[src*="strains-hero"], img[srcset*="strains-hero"]',
  );

  const cardImgs = page.locator("ul li img");
  const count = await cardImgs.count();
  if (count > 0) {
    await waitForAllImagesLoaded(page, "ul li img");
  }
});

test("about page hero renders", async ({ page }) => {
  await gotoWithoutAgeGate(page, "/about");
  await waitForAnyImageLoaded(
    page,
    'img[src*="/about/"], img[srcset*="%2Fabout%2F"]',
  );
});

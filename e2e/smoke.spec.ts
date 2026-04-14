import { test, expect } from "@playwright/test";

test("site responds and renders a heading at /", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.ok()).toBeTruthy();
  await expect(page.locator("h1").first()).toBeVisible();
});

import { test, expect } from "@playwright/test";

test("homepage renders hello hero", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /hello from rooted right farms/i }),
  ).toBeVisible();
});

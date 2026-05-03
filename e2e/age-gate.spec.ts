import { test, expect } from "@playwright/test";

test.describe("age gate", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("first visit is redirected to /age-check with next preserved", async ({
    page,
  }) => {
    await page.goto("/strains");
    await expect(page).toHaveURL(/\/age-check\?next=%2Fstrains$/);
    await expect(page.getByRole("heading", { name: /21 or older/i })).toBeVisible();
  });

  test("confirming 21+ returns to the original URL and persists across reload", async ({
    page,
  }) => {
    await page.goto("/strains");
    await page.getByRole("button", { name: /yes, i.m 21/i }).click();
    await expect(page).toHaveURL(/\/strains$/);

    await page.reload();
    await expect(page).toHaveURL(/\/strains$/);
    await expect(page).not.toHaveURL(/age-check/);
  });

  test("denying age sends the user to /age-blocked", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /no, i.m under 21/i }).click();
    await expect(page).toHaveURL(/\/age-blocked$/);
  });
});

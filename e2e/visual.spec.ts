import { expect, test } from "@playwright/test";

test.describe("visual snapshots", () => {
  test("home idle state", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    await expect(page).toHaveScreenshot("home-idle.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });

  test("destination reveal tray", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });

    await page.route("**/api/kidnap", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          spot: {
            id: "spot-1",
            name: "Denver Art Museum",
            category: "culture",
            description: "Big energy, good exhibits.",
            latitude: 39.7372,
            longitude: -104.9892,
          },
        }),
      });
    });

    await page.goto("/");
    await page.getByRole("button", { name: "Kidnap me" }).click();
    await expect(page.getByText("Denver Art Museum")).toBeVisible();

    await expect(page).toHaveScreenshot("home-reveal.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });
});

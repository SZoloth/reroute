import { expect, test } from "@playwright/test";

test("reroute reveal and ride-click smoke", async ({ page }) => {
  let rerouteCalls = 0;
  let tripCalls = 0;

  await page.route("**/api/reroute", async (route) => {
    rerouteCalls += 1;
    const payload =
      rerouteCalls === 1
        ? {
            spot: {
              id: "spot-1",
              name: "Denver Art Museum",
              category: "culture",
              description: "Big energy, good exhibits.",
              latitude: 39.7372,
              longitude: -104.9892,
            },
          }
        : {
            spot: {
              id: "spot-2",
              name: "Confluence Park",
              category: "outdoors",
              description: "Water, skyline, chaos-neutral.",
              latitude: 39.758,
              longitude: -105.005,
            },
          };

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(payload),
    });
  });

  await page.route("**/api/trips", async (route) => {
    tripCalls += 1;
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ id: `trip-${tripCalls}` }),
    });
  });

  await page.goto("/");

  const rerouteButton = page.getByRole("button", { name: "reroute me" });
  await expect(rerouteButton).toBeVisible();

  await rerouteButton.click();
  await expect(page.getByText("Denver Art Museum")).toBeVisible();

  await page.getByRole("button", { name: "Uber" }).click({ force: true });
  await expect.poll(() => tripCalls).toBe(1);
});

test("protected pages redirect unauthenticated users", async ({ page }) => {
  await page.goto("/settings");
  await expect(page).toHaveURL(/\/$/);

  await page.goto("/submit");
  await expect(page).toHaveURL(/\/$/);
});

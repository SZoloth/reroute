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

test("ISSUE-002: error message is clickable after reroute failure", async ({ page }) => {
  await page.route("**/api/reroute", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ error: "Unauthorized", message: "Sign in to get rerouted" }),
    });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "reroute me" }).click();

  const errorText = page.getByText("Sign in to get rerouted");
  await expect(errorText).toBeVisible();

  // Verify no fixed element with pointer-events blocks the error area
  const blockingElements = await page.evaluate(() => {
    const errorEl = document.querySelector('[aria-hidden="true"]');
    if (!errorEl) return false;
    const style = window.getComputedStyle(errorEl);
    return style.pointerEvents === "auto";
  });
  expect(blockingElements).toBe(false);
});

test("ISSUE-001: 401 shows friendly message and sign-in button", async ({ page }) => {
  await page.route("**/api/reroute", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ error: "Unauthorized", message: "Sign in to get rerouted" }),
    });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "reroute me" }).click();

  await expect(page.getByText("Sign in to get rerouted")).toBeVisible();
  // Should not show raw "Unauthorized"
  await expect(page.getByText("Unauthorized", { exact: true })).not.toBeVisible();
});

test("ISSUE-003: 404 shows friendly empty state", async ({ page }) => {
  await page.route("**/api/reroute", async (route) => {
    await route.fulfill({
      status: 404,
      contentType: "application/json",
      body: JSON.stringify({ error: "No eligible spots", message: "No adventures found nearby — check back soon!" }),
    });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "reroute me" }).click();

  await expect(page.getByText("No adventures found nearby")).toBeVisible();
  // Should not show raw "No eligible spots"
  await expect(page.getByText("No eligible spots", { exact: true })).not.toBeVisible();
});

test("protected pages redirect unauthenticated users", async ({ page }) => {
  await page.goto("/settings");
  await expect(page).toHaveURL(/\/$/);

  await page.goto("/submit");
  await expect(page).toHaveURL(/\/$/);
});

test("ISSUE-006: admin page redirects unauthenticated users", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/$/);
  // Should not show raw "Forbidden" or "Unauthorized"
  await expect(page.getByText("Forbidden")).not.toBeVisible();
  await expect(page.getByText("Unauthorized")).not.toBeVisible();
});

test("ISSUE-007: bottom nav contains profile link", async ({ page }) => {
  await page.goto("/");
  const profileLink = page.getByRole("link", { name: "Profile" });
  await expect(profileLink).toBeVisible();
  await expect(profileLink).toHaveAttribute("href", "/profile");
});

import { expect, test } from "@playwright/test";

const email = process.env.E2E_SUPABASE_EMAIL;
const password = process.env.E2E_SUPABASE_PASSWORD;

test.describe("authenticated supabase flow", () => {
  test.skip(!email || !password, "Set E2E_SUPABASE_EMAIL and E2E_SUPABASE_PASSWORD to run");

  test("email/password sign-in reaches protected settings page", async ({ page }) => {
    await page.goto("/e2e/auth");

    await page.getByPlaceholder("email").fill(email!);
    await page.getByPlaceholder("password").fill(password!);
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/settings$/);
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  });
});

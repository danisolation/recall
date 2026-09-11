import { expect, test } from "@playwright/test";

const password = "correct horse battery staple";

function uniqueEmail(): string {
  return `e2e.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@example.com`;
}

test.describe("authentication", () => {
  test("registers through the UI and lands signed in", async ({ page }) => {
    const email = uniqueEmail();

    await page.goto("/register");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page).toHaveURL(/\/$/);

    // The home page reads the session server-side and names the user.
    await expect(page.getByText("Signed in as")).toBeVisible();
    await expect(page.getByText(email)).toBeVisible();
  });

  test("logs in and logs out through the UI", async ({ page, request }) => {
    const email = uniqueEmail();

    // Account arranged through the API: this test is about the session
    // lifecycle in the browser, not registration (covered above).
    const registerResponse = await request.post("/api/auth/register", {
      data: { email, password },
    });
    expect(registerResponse.status()).toBe(201);

    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Log in" }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText(email)).toBeVisible();

    await page.getByRole("button", { name: "Log out" }).click();

    await expect(page).toHaveURL(/\/login$/);

    // The cookie is gone, so the protected route rejects the browser.
    const afterLogout = await page.request.get("/api/auth/me");
    expect(afterLogout.status()).toBe(401);
  });

  test("shows an error for invalid credentials", async ({ page, request }) => {
    const email = uniqueEmail();

    const registerResponse = await request.post("/api/auth/register", {
      data: { email, password },
    });
    expect(registerResponse.status()).toBe(201);

    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("definitely not the password");
    await page.getByRole("button", { name: "Log in" }).click();

    // Next.js injects its own role="alert" route announcer, so scope to the
    // form's error message.
    await expect(
      page
        .getByRole("alert")
        .filter({ hasText: "Email or password is incorrect." }),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });
});

import { expect, test } from "@playwright/test";

const password = "correct horse battery staple";

function uniqueEmail(): string {
  return `e2e.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@example.com`;
}

test.describe("authentication", () => {
  test("registers through the UI and is signed in", async ({ page }) => {
    const email = uniqueEmail();

    await page.goto("/register");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page).toHaveURL(/\/$/);

    const meResponse = await page.request.get("/api/auth/me");
    expect(meResponse.status()).toBe(200);
    expect((await meResponse.json()).email).toBe(email);
  });

  test("logs in through the UI, uses the session, and logs out", async ({
    page,
    request,
  }) => {
    const email = uniqueEmail();

    // Account arranged through the API; logout has no UI yet (AUTH-023).
    const registerResponse = await request.post("/api/auth/register", {
      data: { email, password },
    });
    expect(registerResponse.status()).toBe(201);

    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Log in" }).click();

    await expect(page).toHaveURL(/\/$/);

    // The session cookie set by login authenticates a protected API route
    // from the browser context.
    const meResponse = await page.request.get("/api/auth/me");
    expect(meResponse.status()).toBe(200);
    expect((await meResponse.json()).email).toBe(email);

    const logoutResponse = await page.request.post("/api/auth/logout");
    expect(logoutResponse.status()).toBe(204);

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

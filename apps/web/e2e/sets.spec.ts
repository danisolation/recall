import { expect, test } from "@playwright/test";

const password = "correct horse battery staple";

function uniqueEmail(): string {
  return `e2e.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@example.com`;
}

test.describe("study sets journey", () => {
  test("creates, lists, views, edits, and deletes a set", async ({ page }) => {
    const email = uniqueEmail();
    const title = "E2E study set";
    const updatedTitle = "E2E study set (updated)";

    // Register through the UI; registration signs the user in.
    await page.goto("/register");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText("Signed in as")).toBeVisible();

    // Dashboard → New set → create → the detail page shows the set.
    await page.getByRole("link", { name: "Dashboard" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await page.getByRole("link", { name: "New set" }).click();
    await expect(page).toHaveURL(/\/sets\/new$/);

    await page.getByLabel("Title").fill(title);
    await page.getByLabel("Description").fill("Made by the E2E journey");
    await page.getByRole("button", { name: "Create set" }).click();

    await expect(page).toHaveURL(/\/sets\/\d+$/);
    await expect(
      page.getByRole("heading", { name: title }),
    ).toBeVisible();
    await expect(page.getByText("Made by the E2E journey")).toBeVisible();

    // The dashboard lists the set; opening it returns to the detail page.
    await page.goto("/dashboard");
    await page.getByRole("link", { name: new RegExp(title) }).click();
    await expect(page).toHaveURL(/\/sets\/\d+$/);
    await expect(page.getByRole("heading", { name: title })).toBeVisible();

    // Edit the set; saving returns to the detail page with new data.
    await page.getByRole("link", { name: "Edit set" }).click();
    await expect(page).toHaveURL(/\/sets\/\d+\/edit$/);
    await expect(page.getByLabel("Title")).toHaveValue(title);
    await expect(page.getByLabel("Description")).toHaveValue(
      "Made by the E2E journey",
    );

    await page.getByLabel("Title").fill(updatedTitle);
    await page.getByRole("button", { name: "Save changes" }).click();

    await expect(page).toHaveURL(/\/sets\/\d+$/);
    await expect(
      page.getByRole("heading", { name: updatedTitle }),
    ).toBeVisible();

    // Delete the set with confirmation; the dashboard no longer lists it.
    await page.getByRole("button", { name: "Delete set" }).click();
    await page.getByRole("button", { name: "Confirm delete" }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("link", { name: new RegExp(title) })).toHaveCount(
      0,
    );
    await expect(
      page.getByText("Create your first study set to start learning."),
    ).toBeVisible();
  });
});

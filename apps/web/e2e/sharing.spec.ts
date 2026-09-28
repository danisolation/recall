import { expect, test } from "@playwright/test";

const password = "correct horse battery staple";

function uniqueEmail(): string {
  return `e2e.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@example.com`;
}

test.describe("sharing", () => {
  // ADR-015's loop end to end: the toggle lives in the owner's edit form,
  // the share URL works with no session at all, and unsharing revokes it.
  // One journey test per the house precedent.
  test("a public set is visible logged out and 404s once private again", async ({
    page,
    browser,
  }) => {
    const email = uniqueEmail();

    await page.goto("/register");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page).toHaveURL(/\/$/);

    // Create a set with two cards through the UI.
    await page.goto("/sets/new");
    await page.getByLabel("Title").fill("E2E sharing set");
    await page.getByLabel("Description").fill("Only visible while public");
    await page.getByRole("button", { name: "Create set" }).click();

    await expect(page).toHaveURL(/\/sets\/\d+$/);
    const setId = page.url().match(/\/sets\/(\d+)$/)?.[1];
    expect(setId).toBeDefined();

    await page.getByLabel("Front").fill("What is mitosis?");
    await page.getByLabel("Back").fill("Cell division");
    await page.getByRole("button", { name: "Add card" }).click();
    await expect(page.getByText("What is mitosis?")).toBeVisible();

    await page.getByLabel("Front").fill("What is osmosis?");
    await page.getByLabel("Back").fill("Diffusion of water");
    await page.getByRole("button", { name: "Add card" }).click();
    await expect(page.getByText("What is osmosis?")).toBeVisible();

    // Toggle the set public in the edit form; the detail page confirms it.
    await page.getByRole("link", { name: "Edit set" }).click();
    await expect(page).toHaveURL(new RegExp(`/sets/${setId}/edit$`));
    await page.getByLabel("Sharing").selectOption("public");
    await page.getByRole("button", { name: "Save changes" }).click();

    await expect(page).toHaveURL(new RegExp(`/sets/${setId}$`));
    // Exact matches: the set title and description contain these words too.
    await expect(page.getByText("Sharing", { exact: true })).toBeVisible();
    await expect(page.getByText("Public", { exact: true })).toBeVisible();

    // A fresh browser context has no session: the share URL still works.
    const visitorContext = await browser.newContext();
    const visitorPage = await visitorContext.newPage();
    await visitorPage.goto(`/share/sets/${setId}`);

    await expect(
      visitorPage.getByRole("heading", { name: "E2E sharing set" }),
    ).toBeVisible();
    await expect(
      visitorPage.getByText("Only visible while public"),
    ).toBeVisible();
    await expect(visitorPage.getByText("What is mitosis?")).toBeVisible();
    await expect(visitorPage.getByText("Diffusion of water")).toBeVisible();

    // Read-only: none of the owner's controls appear, signed out or not.
    await expect(
      visitorPage.getByRole("link", { name: "Edit set" }),
    ).toHaveCount(0);
    await expect(
      visitorPage.getByRole("button", { name: "Study" }),
    ).toHaveCount(0);
    await expect(
      visitorPage.getByRole("button", { name: "Delete set" }),
    ).toHaveCount(0);

    // Toggle back to private; the share URL revokes for the visitor.
    await page.getByRole("link", { name: "Edit set" }).click();
    await expect(page).toHaveURL(new RegExp(`/sets/${setId}/edit$`));
    await page.getByLabel("Sharing").selectOption("private");
    await page.getByRole("button", { name: "Save changes" }).click();

    await expect(page).toHaveURL(new RegExp(`/sets/${setId}$`));

    const revoked = await visitorPage.goto(`/share/sets/${setId}`);
    expect(revoked?.status()).toBe(404);

    await visitorContext.close();
  });
});

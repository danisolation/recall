import { expect, test } from "@playwright/test";

const password = "correct horse battery staple";

function uniqueEmail(): string {
  return `e2e.cards.${Date.now()}.${Math.random()
    .toString(36)
    .slice(2, 8)}@example.com`;
}

test.describe("cards journey", () => {
  test("adds, edits, moves, and deletes cards inside a set, then deletes the set", async ({
    page,
  }) => {
    const email = uniqueEmail();
    const title = "E2E cards set";

    // Register through the UI; registration signs the user in.
    await page.goto("/register");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText("Signed in as")).toBeVisible();

    // Create the host set and land on its detail page.
    await page.getByRole("link", { name: "Dashboard" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await page.getByRole("link", { name: "New set" }).click();
    await expect(page).toHaveURL(/\/sets\/new$/);
    await page.getByLabel("Title").fill(title);
    await page.getByRole("button", { name: "Create set" }).click();
    await expect(page).toHaveURL(/\/sets\/\d+$/);

    // Add three cards; each success clears the form and appends to the list.
    for (const [front, back] of [
      ["Capital of France", "Paris"],
      ["Capital of Japan", "Tokyo"],
      ["Capital of Peru", "Lima"],
    ] as const) {
      await page.getByLabel("Front").fill(front);
      await page.getByLabel("Back").fill(back);
      await page.getByRole("button", { name: "Add card" }).click();
      await expect(
        page.getByRole("listitem").filter({ hasText: front }),
      ).toBeVisible();
    }

    await expect(page.getByRole("listitem")).toHaveText([
      /Capital of France/,
      /Capital of Japan/,
      /Capital of Peru/,
    ]);

    // Edit the second card; saving returns to the detail page with new data.
    await page
      .getByRole("listitem")
      .filter({ hasText: "Capital of Japan" })
      .getByRole("link", { name: "Edit" })
      .click();
    await expect(page).toHaveURL(/\/sets\/\d+\?edit=\d+$/);
    await expect(page.getByLabel("Front")).toHaveValue("Capital of Japan");
    await page.getByLabel("Front").fill("Capital of Japan (updated)");
    await page.getByRole("button", { name: "Save changes" }).click();

    await expect(page).toHaveURL(/\/sets\/\d+$/);
    await expect(
      page.getByRole("listitem").filter({ hasText: "Capital of Japan (updated)" }),
    ).toBeVisible();

    // Move the third card up; the list re-renders in the new order.
    await page
      .getByRole("listitem")
      .filter({ hasText: "Capital of Peru" })
      .getByRole("button", { name: "Move up" })
      .click();

    await expect(page.getByRole("listitem")).toHaveText([
      /Capital of France/,
      /Capital of Peru/,
      /Capital of Japan \(updated\)/,
    ]);

    // Delete a card with confirmation; it disappears from the list.
    await page
      .getByRole("listitem")
      .filter({ hasText: "Capital of Peru" })
      .getByRole("button", { name: "Delete" })
      .click();
    await page.getByRole("button", { name: "Confirm delete" }).click();

    await expect(
      page.getByRole("listitem").filter({ hasText: "Capital of Peru" }),
    ).toHaveCount(0);
    await expect(page.getByRole("listitem")).toHaveText([
      /Capital of France/,
      /Capital of Japan \(updated\)/,
    ]);

    // Deleting the set removes its cards with it and empties the dashboard.
    await page.getByRole("button", { name: "Delete set" }).click();
    await page.getByRole("button", { name: "Confirm delete" }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(
      page.getByText("Create your first study set to start learning."),
    ).toBeVisible();
  });
});

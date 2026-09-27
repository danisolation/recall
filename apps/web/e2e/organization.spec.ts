import { expect, test } from "@playwright/test";

const password = "correct horse battery staple";

function uniqueEmail(): string {
  return `e2e.org.${Date.now()}.${Math.random()
    .toString(36)
    .slice(2, 8)}@example.com`;
}

test.describe("organization journey", () => {
  test("labels sets through the forms, filters by tag, and composes with search", async ({
    page,
  }) => {
    const email = uniqueEmail();

    // Register through the UI; registration signs the user in.
    await page.goto("/register");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page).toHaveURL(/\/$/);

    // Create two sets labeled through the create form's Tags field.
    await page.goto("/dashboard");
    await page.getByRole("link", { name: "New set" }).click();
    await expect(page).toHaveURL(/\/sets\/new$/);
    await page.getByLabel("Title").fill("Spanish vocabulary");
    await page.getByLabel("Tags").fill("language, vocabulary");
    await page.getByRole("button", { name: "Create set" }).click();
    await expect(page).toHaveURL(/\/sets\/\d+$/);
    // The detail page shows the set's tags, ordered by name.
    await expect(page.getByText("language, vocabulary")).toBeVisible();

    await page.goto("/dashboard");
    await page.getByRole("link", { name: "New set" }).click();
    await expect(page).toHaveURL(/\/sets\/new$/);
    await page.getByLabel("Title").fill("Japanese kanji");
    await page.getByLabel("Tags").fill("language");
    await page.getByRole("button", { name: "Create set" }).click();
    await expect(page).toHaveURL(/\/sets\/\d+$/);
    await expect(page.getByText("language")).toBeVisible();

    // Relabel the second set through the edit form, prefilled with its
    // current tags.
    await page.getByRole("link", { name: "Edit set" }).click();
    await expect(page).toHaveURL(/\/sets\/\d+\/edit$/);
    await expect(page.getByLabel("Tags")).toHaveValue("language");
    await page.getByLabel("Tags").fill("language, jlpt");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page).toHaveURL(/\/sets\/\d+$/);
    await expect(page.getByText("jlpt, language")).toBeVisible();

    await page.goto("/dashboard");
    await expect(
      page.getByRole("link", { name: /Spanish vocabulary/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Japanese kanji/ }),
    ).toBeVisible();

    // The tag row lists the union of the user's tags; the shared tag keeps
    // both sets. (exact: true — "vocabulary" is a substring of the set
    // link's name.)
    await page.getByRole("link", { name: "language", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard\?tag=\d+$/);
    await expect(
      page.getByRole("link", { name: /Spanish vocabulary/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Japanese kanji/ }),
    ).toBeVisible();

    // The narrower tag keeps only the Spanish set.
    await page.getByRole("link", { name: "vocabulary", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard\?tag=\d+$/);
    await expect(
      page.getByRole("link", { name: /Spanish vocabulary/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Japanese kanji/ }),
    ).toHaveCount(0);

    // Search composes with the active tag through the form's hidden field.
    // (The GET form serializes the hidden tag before q, so both orders are
    // asserted param-by-param rather than pinning serialization order.)
    await page.getByLabel("Search sets").fill("Spanish");
    await page.getByRole("button", { name: "Search" }).click();
    await expect(page).toHaveURL(/\/dashboard\?.*tag=\d+/);
    await expect(page).toHaveURL(/q=Spanish/);
    await expect(
      page.getByRole("link", { name: /Spanish vocabulary/ }),
    ).toBeVisible();

    // The combination matching nothing names both filters.
    await page.getByLabel("Search sets").fill("zzzz");
    await page.getByRole("button", { name: "Search" }).click();
    await expect(page).toHaveURL(/\/dashboard\?.*tag=\d+/);
    await expect(page).toHaveURL(/q=zzzz/);
    await expect(
      page.getByText(
        'No sets match "zzzz" with the selected tag. Clear the filter to see all of your sets.',
      ),
    ).toBeVisible();

    // Clearing the tag filter keeps the query: the text-only no-matches
    // state is distinct, and the escape hatch always works.
    await page.getByRole("link", { name: "Clear filter" }).click();
    await expect(page).toHaveURL(/\/dashboard\?q=zzzz$/);
    await expect(
      page.getByText('No sets match "zzzz". Try a different search.'),
    ).toBeVisible();
  });
});

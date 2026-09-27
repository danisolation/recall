import { expect, test } from "@playwright/test";

const password = "correct horse battery staple";

function uniqueEmail(): string {
  return `e2e.search.${Date.now()}.${Math.random()
    .toString(36)
    .slice(2, 8)}@example.com`;
}

test.describe("search journey", () => {
  test("filters the dashboard's sets, shows no-matches, and clears back", async ({
    page,
  }) => {
    const email = uniqueEmail();

    // Register through the UI; registration signs the user in.
    await page.goto("/register");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page).toHaveURL(/\/$/);

    // Create two distinguishable sets through the UI.
    for (const title of ["Spanish vocabulary", "Japanese kanji"]) {
      await page.goto("/dashboard");
      await page.getByRole("link", { name: "New set" }).click();
      await expect(page).toHaveURL(/\/sets\/new$/);
      await page.getByLabel("Title").fill(title);
      await page.getByRole("button", { name: "Create set" }).click();
      await expect(page).toHaveURL(/\/sets\/\d+$/);
    }

    await page.goto("/dashboard");
    await expect(
      page.getByRole("link", { name: /Spanish vocabulary/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Japanese kanji/ }),
    ).toBeVisible();

    // The search filters the library down to the matching set.
    await page.getByLabel("Search sets").fill("Spanish");
    await page.getByRole("button", { name: "Search" }).click();
    await expect(page).toHaveURL(/\/dashboard\?q=Spanish$/);
    await expect(
      page.getByRole("link", { name: /Spanish vocabulary/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Japanese kanji/ }),
    ).toHaveCount(0);

    // A nonsense query shows the no-matches state with the query kept.
    await page.getByLabel("Search sets").fill("zzzz");
    await page.getByRole("button", { name: "Search" }).click();
    await expect(
      page.getByText('No sets match "zzzz". Try a different search.'),
    ).toBeVisible();
    await expect(page.getByLabel("Search sets")).toHaveValue("zzzz");

    // Clearing the query restores the whole library.
    await page.getByLabel("Search sets").fill("");
    await page.getByRole("button", { name: "Search" }).click();
    await expect(page).toHaveURL(/\/dashboard\?q=$/);
    await expect(
      page.getByRole("link", { name: /Spanish vocabulary/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Japanese kanji/ }),
    ).toBeVisible();
  });
});

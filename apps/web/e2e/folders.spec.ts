import { expect, test } from "@playwright/test";

const password = "correct horse battery staple";

function uniqueEmail(): string {
  return `e2e.folders.${Date.now()}.${Math.random()
    .toString(36)
    .slice(2, 8)}@example.com`;
}

test.describe("folders journey", () => {
  test("creates folders, files sets, filters by folder, and deletes it safely", async ({
    page,
  }) => {
    const email = uniqueEmail();

    // Register through the UI; registration signs the user in.
    await page.goto("/register");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page).toHaveURL(/\/$/);

    // Create the folder on the management page (reached from the dashboard).
    await page.goto("/dashboard");
    await page.getByRole("link", { name: "Manage folders" }).click();
    await expect(page).toHaveURL(/\/folders$/);
    await page.getByLabel("New folder").fill("University");
    await page.getByRole("button", { name: "Create folder" }).click();
    await expect(page.getByText("University")).toBeVisible();
    await expect(page.getByText("0 sets")).toBeVisible();

    // Create two sets filed into the folder, one tagged.
    await page.goto("/sets/new");
    await page.getByLabel("Title").fill("Spanish vocabulary");
    await page.getByLabel("Tags").fill("language");
    await page.getByLabel("Folder").selectOption({ label: "University" });
    await page.getByRole("button", { name: "Create set" }).click();
    await expect(page).toHaveURL(/\/sets\/\d+$/);

    await page.goto("/sets/new");
    await page.getByLabel("Title").fill("Japanese kanji");
    await page.getByLabel("Folder").selectOption({ label: "University" });
    await page.getByRole("button", { name: "Create set" }).click();
    await expect(page).toHaveURL(/\/sets\/\d+$/);

    // The dashboard lists the folder with its count; filtering keeps both.
    await page.goto("/dashboard");
    await page.getByRole("link", { name: /University · 2/ }).click();
    await expect(page).toHaveURL(/\/dashboard\?folder=\d+$/);
    await expect(
      page.getByRole("link", { name: /Spanish vocabulary/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Japanese kanji/ }),
    ).toBeVisible();

    // The tag composes with the folder.
    await page.getByRole("link", { name: "language", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard\?tag=\d+&folder=\d+$/);
    await expect(
      page.getByRole("link", { name: /Spanish vocabulary/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Japanese kanji/ }),
    ).toHaveCount(0);

    // Search composes through the hidden fields — serialization order is
    // the browser's, so assert the params rather than their order.
    await page.getByLabel("Search sets").fill("Spanish");
    await page.getByRole("button", { name: "Search" }).click();
    await expect(page).toHaveURL(/tag=\d+/);
    await expect(page).toHaveURL(/folder=\d+/);
    await expect(page).toHaveURL(/q=Spanish/);
    await expect(
      page.getByRole("link", { name: /Spanish vocabulary/ }),
    ).toBeVisible();

    // The combination matching nothing names all three filters.
    await page.getByLabel("Search sets").fill("zzzz");
    await page.getByRole("button", { name: "Search" }).click();
    await expect(
      page.getByText(
        'No sets match "zzzz" with the selected tag with the selected folder. Clear the filter to see all of your sets.',
      ),
    ).toBeVisible();

    // The clear link unwinds the tag first, keeping the folder and query.
    await page.getByRole("link", { name: "Clear filter" }).click();
    await expect(page).toHaveURL(/q=zzzz/);
    await expect(page).toHaveURL(/folder=\d+/);
    await expect(
      page.getByText(
        'No sets match "zzzz" with the selected folder. Clear the filter to see all of your sets.',
      ),
    ).toBeVisible();

    // Deleting the folder unfiles its sets — content survives.
    await page.goto("/folders");
    await page.getByRole("button", { name: "Delete" }).click();
    await page.getByRole("button", { name: "Confirm delete" }).click();
    await expect(
      page.getByText("No folders yet. Create one to group your sets."),
    ).toBeVisible();

    await page.goto("/dashboard");
    await expect(
      page.getByRole("link", { name: /Spanish vocabulary/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Japanese kanji/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /University · 2/ }),
    ).toHaveCount(0);
  });
});

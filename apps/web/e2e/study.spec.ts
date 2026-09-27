import { expect, test } from "@playwright/test";

const password = "correct horse battery staple";

function uniqueEmail(): string {
  return `e2e.study.${Date.now()}.${Math.random()
    .toString(36)
    .slice(2, 8)}@example.com`;
}

test.describe("study journey", () => {
  test("studies a set card by card, reaches the summary, and finishes the session", async ({
    page,
  }) => {
    const email = uniqueEmail();
    const title = "E2E study set";

    // Register through the UI; registration signs the user in.
    await page.goto("/register");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText("Signed in as")).toBeVisible();

    // Create the set and land on its detail page.
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

    // Start studying from the set's primary control.
    await page.getByRole("button", { name: "Study" }).click();
    await expect(page).toHaveURL(/\/study\/\d+$/);
    const sessionId = Number(new URL(page.url()).pathname.split("/").pop());

    // Card 1: reveal, correct.
    await expect(page.getByText("Capital of France")).toBeVisible();
    await expect(page.getByText("0 of 3 answered")).toBeVisible();
    await page.getByRole("button", { name: "Reveal answer" }).click();
    await expect(page.getByText("Paris")).toBeVisible();
    await page.getByRole("button", { name: "Correct", exact: true }).click();

    // Card 2: reveal, incorrect.
    await expect(page.getByText("Capital of Japan")).toBeVisible();
    await expect(page.getByText("1 of 3 answered")).toBeVisible();
    await page.getByRole("button", { name: "Reveal answer" }).click();
    await expect(page.getByText("Tokyo")).toBeVisible();
    await page.getByRole("button", { name: "Incorrect", exact: true }).click();

    // Card 3: reveal, correct.
    await expect(page.getByText("Capital of Peru")).toBeVisible();
    await expect(page.getByText("2 of 3 answered")).toBeVisible();
    await page.getByRole("button", { name: "Reveal answer" }).click();
    await expect(page.getByText("Lima")).toBeVisible();
    await page.getByRole("button", { name: "Correct", exact: true }).click();

    // The completion summary reflects the recorded reviews.
    await expect(
      page.getByRole("heading", { name: "Session complete" }),
    ).toBeVisible();
    await expect(page.getByText("3 of 3 answered")).toBeVisible();
    await expect(
      page.getByText("2 of 3 correct (67% accuracy)"),
    ).toBeVisible();

    // Completing the pass finished the session server-side (STUDY-010 is
    // idempotent, so the client's single fire-and-forget call is safe).
    await expect
      .poll(async () => {
        return page.evaluate(async (id) => {
          const response = await fetch(`/api/study-sessions/${id}`, {
            cache: "no-store",
          });
          const body = (await response.json()) as {
            session: { status: string };
          };
          return body.session.status;
        }, sessionId);
      })
      .toBe("COMPLETED");

    // The way out lands back on the set the session studied.
    await page.getByRole("link", { name: "Back to the set" }).click();
    await expect(page).toHaveURL(/\/sets\/\d+$/);
  });
});

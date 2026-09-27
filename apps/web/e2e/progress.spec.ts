import { expect, test } from "@playwright/test";
import {
  createDb,
  eq,
  userCardProgress,
  users,
} from "@danisolation-recall/database";

const password = "correct horse battery staple";
const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://recall:recall@localhost:5432/recall";

function uniqueEmail(): string {
  return `e2e.progress.${Date.now()}.${Math.random()
    .toString(36)
    .slice(2, 8)}@example.com`;
}

test.describe("progress journey", () => {
  const db = createDb(connectionString);
  const email = uniqueEmail();

  test.afterAll(async () => {
    // Unlike the other journeys this one can clean up after itself — the
    // fixture owns a database handle, so the cascade takes the rest.
    await db.delete(users).where(eq(users.email, email));
    await db.$client.end();
  });

  test("reflects a studied session in the summary and the due queue", async ({
    page,
  }) => {
    // Register through the UI; registration signs the user in.
    await page.goto("/register");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page).toHaveURL(/\/$/);

    // Create the set and its two cards.
    await page.getByRole("link", { name: "Dashboard" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await page.getByRole("link", { name: "New set" }).click();
    await expect(page).toHaveURL(/\/sets\/new$/);
    await page.getByLabel("Title").fill("E2E progress set");
    await page.getByRole("button", { name: "Create set" }).click();
    await expect(page).toHaveURL(/\/sets\/\d+$/);

    for (const [front, back] of [
      ["Capital of France", "Paris"],
      ["Capital of Japan", "Tokyo"],
    ] as const) {
      await page.getByLabel("Front").fill(front);
      await page.getByLabel("Back").fill(back);
      await page.getByRole("button", { name: "Add card" }).click();
      await expect(
        page.getByRole("listitem").filter({ hasText: front }),
      ).toBeVisible();
    }

    // Study the set: one correct, one incorrect.
    await page.getByRole("button", { name: "Study" }).click();
    await expect(page).toHaveURL(/\/study\/\d+$/);

    await expect(page.getByText("Capital of France")).toBeVisible();
    await page.getByRole("button", { name: "Reveal answer" }).click();
    await page.getByRole("button", { name: "Correct", exact: true }).click();

    await expect(page.getByText("Capital of Japan")).toBeVisible();
    await page.getByRole("button", { name: "Reveal answer" }).click();
    await page.getByRole("button", { name: "Incorrect", exact: true }).click();

    await expect(
      page.getByRole("heading", { name: "Session complete" }),
    ).toBeVisible();

    // Into the progress surface through the dashboard's entry point.
    await page.getByRole("link", { name: "Back to the dashboard" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await page.getByRole("link", { name: "View progress" }).click();
    await expect(page).toHaveURL(/\/progress$/);

    // The summary reflects the session; the ladder scheduled both cards
    // into the future, so the queue starts honest and empty.
    await expect(page.getByText("50%")).toBeVisible();
    await expect(page.getByText("2", { exact: true })).toBeVisible();
    await expect(page.getByText("0", { exact: true })).toBeVisible();
    await expect(
      page.getByText("Nothing is due right now."),
    ).toBeVisible();

    const historyItem = page
      .getByRole("link", { name: /E2E progress set/ })
      .filter({ hasText: "Completed" });
    await expect(historyItem).toBeVisible();

    // Fixture: the ladder never schedules into the past (its shortest step
    // is 10 minutes), so the journey pulls the rows' next_review_at back an
    // hour — the browser then proves the queue picks them up.
    const [owner] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email));

    if (!owner) {
      throw new Error("test user vanished");
    }

    await db
      .update(userCardProgress)
      .set({ nextReviewAt: new Date(Date.now() - 60 * 60_000) })
      .where(eq(userCardProgress.userId, owner.id));

    await page.reload();

    await expect(
      page.getByText("Nothing is due right now."),
    ).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: /Capital of France/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Capital of Japan/ }),
    ).toBeVisible();

    // A queue item leads back to the set where studying happens.
    await page.getByRole("link", { name: /Capital of Japan/ }).click();
    await expect(page).toHaveURL(/\/sets\/\d+$/);
  });
});

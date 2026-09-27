import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  createDb,
  eq,
  users,
} from "@danisolation-recall/database";
import { CardsRepository } from "../cards/cards.repository";
import { SessionsRepository } from "../study/sessions.repository";
import { SetsRepository } from "../sets/sets.repository";
import { ProgressRepository } from "./progress.repository";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to run integration tests");
}

const now = new Date("2026-09-26T12:00:00.000Z");
const dayMs = 24 * 60 * 60 * 1000;
const tenMinutesMs = 10 * 60 * 1000;

describe("ProgressRepository", () => {
  const db = createDb(connectionString);
  const progress = new ProgressRepository(db);
  const sessions = new SessionsRepository(db);
  const sets = new SetsRepository(db);
  const cards = new CardsRepository(db);

  const ownerEmail = "progress.repository.owner@example.com";
  const otherEmail = "progress.repository.other@example.com";
  const emptyEmail = "progress.repository.empty@example.com";

  let ownerId!: number;
  let otherId!: number;
  let emptyId!: number;
  let setId!: number;
  let cardAId!: number;
  let cardBId!: number;
  let cardCId!: number;
  let cardDId!: number;

  beforeAll(async () => {
    for (const email of [ownerEmail, otherEmail, emptyEmail]) {
      await db.delete(users).where(eq(users.email, email));
    }

    const [owner] = await db
      .insert(users)
      .values({ email: ownerEmail })
      .returning();
    const [other] = await db
      .insert(users)
      .values({ email: otherEmail })
      .returning();
    const [empty] = await db
      .insert(users)
      .values({ email: emptyEmail })
      .returning();

    if (!owner || !other || !empty) {
      throw new Error("Failed to create test users");
    }

    ownerId = owner.id;
    otherId = other.id;
    emptyId = empty.id;

    const set = await sets.create(ownerId, { title: "Progress set" });
    setId = set.id;

    const cardA = await cards.create(setId, ownerId, {
      front: "Front A",
      back: "Back A",
    });
    const cardB = await cards.create(setId, ownerId, {
      front: "Front B",
      back: "Back B",
    });
    const cardC = await cards.create(setId, ownerId, {
      front: "Front C",
      back: "Back C",
    });
    const cardD = await cards.create(setId, ownerId, {
      front: "Front D",
      back: "Back D",
    });

    if (!cardA || !cardB || !cardC || !cardD) {
      throw new Error("Failed to create test cards");
    }

    cardAId = cardA.id;
    cardBId = cardB.id;
    cardCId = cardC.id;
    cardDId = cardD.id;

    // Session 1: A correct, then B, C, D incorrect — three cards due, one
    // walking the ladder.
    const first = await sessions.create(ownerId, setId);
    const t1 = new Date(now.getTime() - 3 * dayMs);

    await sessions.addReview(first!.id, ownerId, cardAId, true, t1);
    await sessions.addReview(
      first!.id,
      ownerId,
      cardBId,
      false,
      new Date(t1.getTime() + 60_000),
    );
    await sessions.addReview(
      first!.id,
      ownerId,
      cardCId,
      false,
      new Date(t1.getTime() + 120_000),
    );
    await sessions.addReview(
      first!.id,
      ownerId,
      cardDId,
      false,
      new Date(t1.getTime() + 180_000),
    );

    // Session 2: A correct again — its next review lands in the future, so
    // it leaves the due queue.
    const second = await sessions.create(ownerId, setId);
    await sessions.addReview(
      second!.id,
      ownerId,
      cardAId,
      true,
      new Date(now.getTime() - 60 * 60_000),
    );

    // The other user studies one card of their own; none of it may leak.
    const otherSet = await sets.create(otherId, { title: "Other set" });
    const otherCard = await cards.create(otherSet.id, otherId, {
      front: "Outsider",
      back: "Nope",
    });
    const otherSession = await sessions.create(otherId, otherSet.id);
    await sessions.addReview(
      otherSession!.id,
      otherId,
      otherCard!.id,
      false,
      new Date(now.getTime() - 60 * 60_000),
    );
  });

  afterAll(async () => {
    for (const email of [ownerEmail, otherEmail, emptyEmail]) {
      await db.delete(users).where(eq(users.email, email));
    }
    await db.$client.end();
  });

  it("sums the caller's review totals across sessions", async () => {
    expect(await progress.getSummary(ownerId)).toEqual({
      totalReviews: 5,
      correctReviews: 2,
    });
    expect(await progress.getSummary(otherId)).toEqual({
      totalReviews: 1,
      correctReviews: 0,
    });
  });

  it("gives a zero-review user an all-zero summary and an empty queue", async () => {
    expect(await progress.getSummary(emptyId)).toEqual({
      totalReviews: 0,
      correctReviews: 0,
    });
    expect(await progress.countDue(emptyId, now)).toBe(0);
    expect(await progress.listDue(emptyId, now, { limit: 10, offset: 0 })).toEqual([]);
  });

  it("lists due cards most-overdue first with their set", async () => {
    const due = await progress.listDue(ownerId, now, { limit: 10, offset: 0 });

    expect(due.map((card) => card.cardId)).toEqual([
      cardBId,
      cardCId,
      cardDId,
    ]);
    expect(due[0]).toMatchObject({
      cardId: cardBId,
      front: "Front B",
      setId,
      setTitle: "Progress set",
    });
    expect(due[0]!.nextReviewAt.getTime()).toBe(
      now.getTime() - 3 * dayMs + 60_000 + tenMinutesMs,
    );
  });

  it("keeps a not-yet-due and a never-reviewed card out of the queue", async () => {
    const due = await progress.listDue(ownerId, now, { limit: 10, offset: 0 });

    // A was reviewed correctly again, pushing its next review into the
    // future; E has never been reviewed at all.
    expect(due.map((card) => card.cardId)).not.toContain(cardAId);
    expect(due).toHaveLength(3);
    expect(await progress.countDue(ownerId, now)).toBe(3);
  });

  it("paginates the due list", async () => {
    const firstPage = await progress.listDue(ownerId, now, {
      limit: 2,
      offset: 0,
    });
    expect(firstPage.map((card) => card.cardId)).toEqual([
      cardBId,
      cardCId,
    ]);

    const secondPage = await progress.listDue(ownerId, now, {
      limit: 2,
      offset: 2,
    });
    expect(secondPage.map((card) => card.cardId)).toEqual([cardDId]);
  });

  it("excludes other users' rows from every query", async () => {
    const due = await progress.listDue(ownerId, now, { limit: 10, offset: 0 });

    expect(due.every((card) => card.setId === setId)).toBe(true);
    expect(due.every((card) => card.front !== "Outsider")).toBe(true);
    expect(await progress.countDue(otherId, now)).toBe(1);
    expect(
      (await progress.listDue(otherId, now, { limit: 10, offset: 0 })).map(
        (card) => card.front,
      ),
    ).toEqual(["Outsider"]);
  });
});

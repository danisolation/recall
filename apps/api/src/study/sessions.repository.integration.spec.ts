import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  createDb,
  eq,
  users,
} from "@danisolation-recall/database";
import { SetsRepository } from "../sets/sets.repository";
import { CardsRepository } from "../cards/cards.repository";
import { SessionsRepository } from "./sessions.repository";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to run integration tests");
}

const now = new Date("2026-09-26T12:00:00.000Z");

describe("SessionsRepository", () => {
  const db = createDb(connectionString);
  const sessions = new SessionsRepository(db);
  const sets = new SetsRepository(db);
  const cards = new CardsRepository(db);
  const ownerEmail = "sessions.repository.owner@example.com";
  const otherEmail = "sessions.repository.other@example.com";

  let ownerId!: number;
  let otherId!: number;
  let setId!: number;
  let cardAId!: number;
  let cardBId!: number;

  beforeAll(async () => {
    await db.delete(users).where(eq(users.email, ownerEmail));
    await db.delete(users).where(eq(users.email, otherEmail));

    const [owner] = await db
      .insert(users)
      .values({ email: ownerEmail })
      .returning();
    const [other] = await db
      .insert(users)
      .values({ email: otherEmail })
      .returning();

    if (!owner || !other) {
      throw new Error("Failed to create test users");
    }

    ownerId = owner.id;
    otherId = other.id;

    const set = await sets.create(ownerId, { title: "Session test set" });
    setId = set.id;

    const cardA = await cards.create(setId, ownerId, {
      front: "Front A",
      back: "Back A",
    });
    const cardB = await cards.create(setId, ownerId, {
      front: "Front B",
      back: "Back B",
    });

    if (!cardA || !cardB) {
      throw new Error("Failed to create test cards");
    }

    cardAId = cardA.id;
    cardBId = cardB.id;
  });

  afterAll(async () => {
    await db.delete(users).where(eq(users.email, ownerEmail));
    await db.delete(users).where(eq(users.email, otherEmail));
    await db.$client.end();
  });

  it("creates an ACTIVE session for an owned set", async () => {
    const session = await sessions.create(ownerId, setId);

    expect(session).not.toBeNull();
    expect(session!.status).toBe("ACTIVE");
    expect(session!.setId).toBe(setId);
    expect(session!.userId).toBe(ownerId);
    expect(session!.finishedAt).toBeNull();
    expect(session!.startedAt).toBeInstanceOf(Date);
  });

  it("does not create a session for a foreign or unknown set", async () => {
    const foreignSet = await sets.create(otherId, { title: "Foreign set" });

    expect(await sessions.create(ownerId, foreignSet.id)).toBeNull();
    expect(await sessions.create(ownerId, 99999999)).toBeNull();
  });

  it("finds a session for its owner and hides it from other users", async () => {
    const created = await sessions.create(ownerId, setId);

    expect(await sessions.findById(created!.id, ownerId)).not.toBeNull();
    expect(await sessions.findById(created!.id, otherId)).toBeNull();
    expect(await sessions.findById(99999999, ownerId)).toBeNull();
  });

  it("lists the user's sessions newest first with pagination", async () => {
    const first = await sessions.create(ownerId, setId);
    const second = await sessions.create(ownerId, setId);
    const third = await sessions.create(ownerId, setId);

    const page = await sessions.listByUser(ownerId, { limit: 2, offset: 0 });

    expect(page.map((session) => session.id)).toEqual([
      third!.id,
      second!.id,
    ]);

    const pageTwo = await sessions.listByUser(ownerId, { limit: 2, offset: 2 });

    // Earlier tests created sessions too; slicing is what matters here, so
    // only the first slot of the second page is pinned.
    expect(pageTwo[0]!.id).toBe(first!.id);
    expect(await sessions.listByUser(otherId, { limit: 10, offset: 0 })).toEqual([]);
  });

  it("completes an active session and sets finished_at", async () => {
    const created = await sessions.create(ownerId, setId);

    const result = await sessions.complete(created!.id, ownerId);

    expect(result.outcome).toBe("transitioned");
    if (result.outcome === "transitioned") {
      expect(result.session.status).toBe("COMPLETED");
      expect(result.session.finishedAt).toBeInstanceOf(Date);
    }
  });

  it("treats a repeat complete as an unchanged no-op", async () => {
    const created = await sessions.create(ownerId, setId);
    await sessions.complete(created!.id, ownerId);

    const result = await sessions.complete(created!.id, ownerId);

    expect(result.outcome).toBe("unchanged");
  });

  it("rejects abandoning a completed session as a conflict", async () => {
    const created = await sessions.create(ownerId, setId);
    await sessions.complete(created!.id, ownerId);

    const result = await sessions.abandon(created!.id, ownerId);

    expect(result.outcome).toBe("conflict");
  });

  it("abandons an active session", async () => {
    const created = await sessions.create(ownerId, setId);

    const result = await sessions.abandon(created!.id, ownerId);

    expect(result.outcome).toBe("transitioned");
    if (result.outcome === "transitioned") {
      expect(result.session.status).toBe("ABANDONED");
      expect(result.session.finishedAt).toBeInstanceOf(Date);
    }
  });

  it("returns notFound for a foreign or unknown session transition", async () => {
    const foreignSet = await sets.create(otherId, { title: "Other set" });
    const foreignSession = await sessions.create(otherId, foreignSet.id);

    expect((await sessions.complete(foreignSession!.id, ownerId)).outcome).toBe("notFound");
    expect((await sessions.complete(99999999, ownerId)).outcome).toBe("notFound");
  });

  it("records a review and inserts progress for the first review", async () => {
    const created = await sessions.create(ownerId, setId);

    const result = await sessions.addReview(
      created!.id,
      ownerId,
      cardAId,
      true,
      now,
    );

    expect(result.outcome).toBe("recorded");
    if (result.outcome === "recorded") {
      expect(result.review.correct).toBe(true);
      expect(result.review.reviewedAt.getTime()).toBe(now.getTime());
      expect(result.progress.reviewCount).toBe(1);
      expect(result.progress.correctCount).toBe(1);
      expect(result.progress.streak).toBe(1);
      expect(result.progress.nextReviewAt!.getTime()).toBe(
        now.getTime() + 24 * 60 * 60_000,
      );
      expect(result.progress.lastReviewedAt!.getTime()).toBe(now.getTime());
    }
  });

  it("updates existing progress on a later review of the same card", async () => {
    const firstSession = await sessions.create(ownerId, setId);
    await sessions.addReview(firstSession!.id, ownerId, cardBId, true, now);

    const secondSession = await sessions.create(ownerId, setId);
    const later = new Date(now.getTime() + 60_000);
    const result = await sessions.addReview(
      secondSession!.id,
      ownerId,
      cardBId,
      true,
      later,
    );

    expect(result.outcome).toBe("recorded");
    if (result.outcome === "recorded") {
      expect(result.progress.reviewCount).toBe(2);
      expect(result.progress.correctCount).toBe(2);
      expect(result.progress.streak).toBe(2);
      expect(result.progress.nextReviewAt!.getTime()).toBe(
        later.getTime() + 3 * 24 * 60 * 60_000,
      );
    }
  });

  it("records an incorrect review, resetting the streak", async () => {
    const created = await sessions.create(ownerId, setId);
    const freshCard = await cards.create(setId, ownerId, {
      front: "Fresh incorrect",
      back: "Fresh back",
    });

    const result = await sessions.addReview(
      created!.id,
      ownerId,
      freshCard!.id,
      false,
      now,
    );

    expect(result.outcome).toBe("recorded");
    if (result.outcome === "recorded") {
      expect(result.progress.reviewCount).toBe(1);
      expect(result.progress.correctCount).toBe(0);
      expect(result.progress.streak).toBe(0);
      expect(result.progress.nextReviewAt!.getTime()).toBe(
        now.getTime() + 10 * 60_000,
      );
    }
  });

  it("rejects a duplicate review of the same card in one session", async () => {
    const created = await sessions.create(ownerId, setId);
    await sessions.addReview(created!.id, ownerId, cardAId, true, now);

    const result = await sessions.addReview(
      created!.id,
      ownerId,
      cardAId,
      false,
      now,
    );

    expect(result.outcome).toBe("duplicate");
  });

  it("rejects a review for a card outside the session's set", async () => {
    const foreignSet = await sets.create(ownerId, { title: "Other owned set" });
    const foreignCard = await cards.create(foreignSet.id, ownerId, {
      front: "Outsider",
      back: "Nope",
    });
    const created = await sessions.create(ownerId, setId);

    const result = await sessions.addReview(
      created!.id,
      ownerId,
      foreignCard!.id,
      true,
      now,
    );

    expect(result.outcome).toBe("cardNotInSet");
  });

  it("rejects a review on a non-active session", async () => {
    const created = await sessions.create(ownerId, setId);
    await sessions.complete(created!.id, ownerId);

    const result = await sessions.addReview(
      created!.id,
      ownerId,
      cardAId,
      true,
      now,
    );

    expect(result.outcome).toBe("sessionNotActive");
  });

  it("returns notFound for a review in a foreign or unknown session", async () => {
    const foreignSet = await sets.create(otherId, { title: "Other set two" });
    const otherSession = await sessions.create(otherId, foreignSet.id);

    expect(
      (await sessions.addReview(otherSession!.id, ownerId, cardAId, true, now)).outcome,
    ).toBe("notFound");
    expect(
      (await sessions.addReview(99999999, ownerId, cardAId, true, now)).outcome,
    ).toBe("notFound");
  });

  it("lists a session's reviews chronologically for its owner only", async () => {
    const created = await sessions.create(ownerId, setId);
    const earlier = new Date(now.getTime() - 60_000);
    await sessions.addReview(created!.id, ownerId, cardAId, true, earlier);
    await sessions.addReview(created!.id, ownerId, cardBId, false, now);

    const listed = await sessions.listReviewsBySession(created!.id, ownerId);

    expect(listed).toHaveLength(2);
    expect(listed[0]!.cardId).toBe(cardAId);
    expect(listed[0]!.correct).toBe(true);
    expect(listed[1]!.cardId).toBe(cardBId);
    expect(listed[1]!.correct).toBe(false);
    expect(
      await sessions.listReviewsBySession(created!.id, otherId),
    ).toEqual([]);
  });

  it("lists a session's cards in position order, hiding foreign sessions", async () => {
    const created = await sessions.create(ownerId, setId);

    const listed = await sessions.listSessionCards(created!.id, ownerId);

    // Earlier tests appended cards to this set; the first two positions are
    // still the seeded cards, which is the ordering claim under test.
    expect(listed!.slice(0, 2).map((card) => card.id)).toEqual([
      cardAId,
      cardBId,
    ]);
    expect(await sessions.listSessionCards(created!.id, otherId)).toBeNull();
    expect(await sessions.listSessionCards(99999999, ownerId)).toBeNull();
  });
});

import "reflect-metadata";
import { type INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import {
  and,
  eq,
  userCardProgress,
  users,
} from "@danisolation-recall/database";
import supertest from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "../app.module";
import { CardsRepository } from "../cards/cards.repository";
import { hashPassword } from "../auth/password";
import { UsersRepository } from "../auth/users.repository";
import { DATABASE_PROVIDER, type Database } from "../database/database.module";
import { SetsRepository } from "../sets/sets.repository";
import { SessionsRepository } from "./sessions.repository";

describe("POST /study-sessions/:id/reviews (integration)", () => {
  let app: INestApplication;
  let db: Database;

  const email = "record-review.integration@example.com";
  const otherEmail = "record-review.integration.other@example.com";
  const password = "correct horse battery staple";
  const DAY_MS = 24 * 60 * 60 * 1000;
  const RESET_MS = 10 * 60 * 1000;
  let sessionCookie: string;
  let ownerId: number;
  let otherId: number;
  let sets: SetsRepository;
  let cards: CardsRepository;
  let sessions: SessionsRepository;
  let setId: number;
  let cardAId: number;
  let cardBId: number;
  let outsideCardId: number;
  let sessionId: number;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    db = app.get<Database>(DATABASE_PROVIDER);
    await db.delete(users).where(eq(users.email, email));
    await db.delete(users).where(eq(users.email, otherEmail));

    const usersRepository = app.get(UsersRepository);
    const owner = await usersRepository.create({
      email,
      passwordHash: await hashPassword(password),
    });
    ownerId = owner.id;

    const other = await usersRepository.create({ email: otherEmail });
    otherId = other.id;

    sets = app.get(SetsRepository);
    cards = app.get(CardsRepository);
    sessions = app.get(SessionsRepository);

    const set = await sets.create(ownerId, { title: "Record review set" });
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

    const otherOwnedSet = await sets.create(ownerId, {
      title: "Set holding the outside card",
    });
    const outsideCard = await cards.create(otherOwnedSet.id, ownerId, {
      front: "Outsider",
      back: "Not in the studied set",
    });

    if (!outsideCard) {
      throw new Error("Failed to create the outside card");
    }

    outsideCardId = outsideCard.id;

    const created = await sessions.create(ownerId, setId);

    if (!created) {
      throw new Error("Failed to create the studied session");
    }

    sessionId = created.id;

    const loginResponse = await supertest(app.getHttpServer())
      .post("/auth/login")
      .send({ email, password });

    expect(loginResponse.status).toBe(200);

    const setCookie = loginResponse.headers["set-cookie"];
    const [cookie] = Array.isArray(setCookie) ? setCookie : [];

    if (!cookie) {
      throw new Error("login did not set a session cookie");
    }

    sessionCookie = cookie;
  });

  afterAll(async () => {
    await db.delete(users).where(eq(users.email, email));
    await db.delete(users).where(eq(users.email, otherEmail));
    await app.close();
    await db.$client.end();
  });

  async function getProgress(cardId: number) {
    const [progress] = await db
      .select()
      .from(userCardProgress)
      .where(
        and(
          eq(userCardProgress.userId, ownerId),
          eq(userCardProgress.cardId, cardId),
        ),
      );

    if (!progress) {
      throw new Error(`no progress row for card ${cardId}`);
    }

    return progress;
  }

  it("records a correct review and updates progress in the same transaction", async () => {
    const response = await supertest(app.getHttpServer())
      .post(`/study-sessions/${sessionId}/reviews`)
      .set("Cookie", sessionCookie)
      .send({ cardId: cardAId, correct: true });

    expect(response.status).toBe(201);
    expect(response.body.id).toBeGreaterThan(0);
    expect(response.body.sessionId).toBe(sessionId);
    expect(response.body.cardId).toBe(cardAId);
    expect(response.body.correct).toBe(true);
    expect(response.body.reviewedAt).toBeTruthy();

    const progress = await getProgress(cardAId);
    const reviewedAt = new Date(response.body.reviewedAt).getTime();

    expect(progress.reviewCount).toBe(1);
    expect(progress.correctCount).toBe(1);
    expect(progress.streak).toBe(1);
    expect(progress.lastReviewedAt!.getTime()).toBe(reviewedAt);
    expect(progress.nextReviewAt!.getTime() - reviewedAt).toBe(DAY_MS);
  });

  it("records an incorrect review and resets the streak", async () => {
    const response = await supertest(app.getHttpServer())
      .post(`/study-sessions/${sessionId}/reviews`)
      .set("Cookie", sessionCookie)
      .send({ cardId: cardBId, correct: false });

    expect(response.status).toBe(201);
    expect(response.body.correct).toBe(false);

    const progress = await getProgress(cardBId);
    const reviewedAt = new Date(response.body.reviewedAt).getTime();

    expect(progress.reviewCount).toBe(1);
    expect(progress.correctCount).toBe(0);
    expect(progress.streak).toBe(0);
    expect(progress.lastReviewedAt!.getTime()).toBe(reviewedAt);
    expect(progress.nextReviewAt!.getTime() - reviewedAt).toBe(RESET_MS);
  });

  it("rejects a repeat answer for the same card with 409 REVIEW_ALREADY_RECORDED", async () => {
    const response = await supertest(app.getHttpServer())
      .post(`/study-sessions/${sessionId}/reviews`)
      .set("Cookie", sessionCookie)
      .send({ cardId: cardAId, correct: false });

    expect(response.status).toBe(409);
    expect(response.body.code).toBe("REVIEW_ALREADY_RECORDED");
  });

  it("rejects a review on a finished session with 409 INVALID_STUDY_SESSION", async () => {
    const created = await sessions.create(ownerId, setId);
    await sessions.complete(created!.id, ownerId);

    const response = await supertest(app.getHttpServer())
      .post(`/study-sessions/${created!.id}/reviews`)
      .set("Cookie", sessionCookie)
      .send({ cardId: cardAId, correct: true });

    expect(response.status).toBe(409);
    expect(response.body.code).toBe("INVALID_STUDY_SESSION");
  });

  it("returns 404 CARD_NOT_FOUND for a card outside the set or an unknown card", async () => {
    const outsideResponse = await supertest(app.getHttpServer())
      .post(`/study-sessions/${sessionId}/reviews`)
      .set("Cookie", sessionCookie)
      .send({ cardId: outsideCardId, correct: true });

    expect(outsideResponse.status).toBe(404);
    expect(outsideResponse.body.code).toBe("CARD_NOT_FOUND");

    const unknownResponse = await supertest(app.getHttpServer())
      .post(`/study-sessions/${sessionId}/reviews`)
      .set("Cookie", sessionCookie)
      .send({ cardId: 99999999, correct: true });

    expect(unknownResponse.status).toBe(404);
    expect(unknownResponse.body.code).toBe("CARD_NOT_FOUND");
  });

  it("returns 404 SESSION_NOT_FOUND for a foreign or unknown session", async () => {
    const foreignSet = await sets.create(otherId, { title: "Foreign set" });
    const foreignSession = await sessions.create(otherId, foreignSet.id);

    const foreignResponse = await supertest(app.getHttpServer())
      .post(`/study-sessions/${foreignSession!.id}/reviews`)
      .set("Cookie", sessionCookie)
      .send({ cardId: cardAId, correct: true });

    expect(foreignResponse.status).toBe(404);
    expect(foreignResponse.body.code).toBe("SESSION_NOT_FOUND");

    const missingResponse = await supertest(app.getHttpServer())
      .post("/study-sessions/99999999/reviews")
      .set("Cookie", sessionCookie)
      .send({ cardId: cardAId, correct: true });

    expect(missingResponse.status).toBe(404);
    expect(missingResponse.body.code).toBe("SESSION_NOT_FOUND");
  });

  it("rejects invalid input with 400", async () => {
    const response = await supertest(app.getHttpServer())
      .post(`/study-sessions/${sessionId}/reviews`)
      .set("Cookie", sessionCookie)
      .send({ cardId: cardAId });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("VALIDATION_ERROR");
  });

  it("rejects a request without a session cookie with 401", async () => {
    const response = await supertest(app.getHttpServer())
      .post(`/study-sessions/${sessionId}/reviews`)
      .send({ cardId: cardAId, correct: true });

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("UNAUTHENTICATED");
  });
});

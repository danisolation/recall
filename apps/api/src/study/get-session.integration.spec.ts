import "reflect-metadata";
import { type INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { eq, users } from "@danisolation-recall/database";
import supertest from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "../app.module";
import { CardsRepository } from "../cards/cards.repository";
import { hashPassword } from "../auth/password";
import { UsersRepository } from "../auth/users.repository";
import { DATABASE_PROVIDER, type Database } from "../database/database.module";
import { SetsRepository } from "../sets/sets.repository";
import { SessionsRepository } from "./sessions.repository";

describe("GET /study-sessions/:id (integration)", () => {
  let app: INestApplication;
  let db: Database;

  const email = "get-session.integration@example.com";
  const otherEmail = "get-session.integration.other@example.com";
  const password = "correct horse battery staple";
  let sessionCookie: string;
  let ownerId: number;
  let otherId: number;
  let sets: SetsRepository;
  let cards: CardsRepository;
  let sessions: SessionsRepository;
  let setId: number;
  let cardAId: number;
  let cardBId: number;

  const now = new Date("2026-09-26T12:00:00.000Z");

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

    const set = await sets.create(ownerId, { title: "Get session set" });
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

  it("returns the session with chronological reviews and ordered cards to its owner", async () => {
    const created = await sessions.create(ownerId, setId);
    await sessions.addReview(created!.id, ownerId, cardAId, true, new Date(now.getTime() - 60_000));
    await sessions.addReview(created!.id, ownerId, cardBId, false, now);

    const response = await supertest(app.getHttpServer())
      .get(`/study-sessions/${created!.id}`)
      .set("Cookie", sessionCookie);

    expect(response.status).toBe(200);
    expect(response.body.session.id).toBe(created!.id);
    expect(response.body.session.userId).toBe(ownerId);
    expect(response.body.session.setId).toBe(setId);
    expect(response.body.session.status).toBe("ACTIVE");
    expect(response.body.session.finishedAt).toBeNull();
    expect(response.body.reviews.map((review: { cardId: number; correct: boolean }) => ({
      cardId: review.cardId,
      correct: review.correct,
    }))).toEqual([
      { cardId: cardAId, correct: true },
      { cardId: cardBId, correct: false },
    ]);
    expect(response.body.cards.map((card: { id: number }) => card.id)).toEqual([
      cardAId,
      cardBId,
    ]);
    expect(response.body.cards[0]).toMatchObject({
      front: "Front A",
      back: "Back A",
    });
  });

  it("returns a completed session — GET does not filter by status", async () => {
    const created = await sessions.create(ownerId, setId);
    await sessions.complete(created!.id, ownerId);

    const response = await supertest(app.getHttpServer())
      .get(`/study-sessions/${created!.id}`)
      .set("Cookie", sessionCookie);

    expect(response.status).toBe(200);
    expect(response.body.session.status).toBe("COMPLETED");
    expect(response.body.session.finishedAt).toBeTruthy();
  });

  it("hides a foreign or unknown session behind 404", async () => {
    const foreignSet = await sets.create(otherId, { title: "Foreign set" });
    const foreignSession = await sessions.create(otherId, foreignSet.id);

    const foreignResponse = await supertest(app.getHttpServer())
      .get(`/study-sessions/${foreignSession!.id}`)
      .set("Cookie", sessionCookie);

    expect(foreignResponse.status).toBe(404);
    expect(foreignResponse.body.code).toBe("SESSION_NOT_FOUND");

    const missingResponse = await supertest(app.getHttpServer())
      .get("/study-sessions/99999999")
      .set("Cookie", sessionCookie);

    expect(missingResponse.status).toBe(404);
    expect(missingResponse.body.code).toBe("SESSION_NOT_FOUND");
  });

  it("folds a malformed id into the 404", async () => {
    const response = await supertest(app.getHttpServer())
      .get("/study-sessions/not-a-number")
      .set("Cookie", sessionCookie);

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("SESSION_NOT_FOUND");
  });
});

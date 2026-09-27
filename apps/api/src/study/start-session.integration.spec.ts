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

describe("POST /study-sessions (integration)", () => {
  let app: INestApplication;
  let db: Database;

  const email = "start-session.integration@example.com";
  const otherEmail = "start-session.integration.other@example.com";
  const password = "correct horse battery staple";
  let sessionCookie: string;
  let ownerId: number;
  let sets: SetsRepository;
  let cards: CardsRepository;
  let setId: number;
  let cardAId: number;
  let cardBId: number;
  let foreignSetId: number;

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

    sets = app.get(SetsRepository);
    cards = app.get(CardsRepository);

    const set = await sets.create(ownerId, { title: "Start session set" });
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

    const foreignSet = await sets.create(other.id, {
      title: "Foreign set",
    });
    foreignSetId = foreignSet.id;

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

  it("starts a session for the authenticated user's set with its cards", async () => {
    const response = await supertest(app.getHttpServer())
      .post("/study-sessions")
      .set("Cookie", sessionCookie)
      .send({ setId });

    expect(response.status).toBe(201);
    expect(response.body.session.id).toBeGreaterThan(0);
    expect(response.body.session.userId).toBe(ownerId);
    expect(response.body.session.setId).toBe(setId);
    expect(response.body.session.status).toBe("ACTIVE");
    expect(response.body.session.finishedAt).toBeNull();
    expect(response.body.session.startedAt).toBeTruthy();
    expect(response.body.cards.map((card: { id: number }) => card.id)).toEqual([
      cardAId,
      cardBId,
    ]);
    expect(response.body.cards[0]).toMatchObject({
      front: "Front A",
      back: "Back A",
    });
  });

  it("rejects a request without a session cookie with 401", async () => {
    const response = await supertest(app.getHttpServer())
      .post("/study-sessions")
      .send({ setId });

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("UNAUTHENTICATED");
  });

  it("rejects invalid input with 400", async () => {
    const response = await supertest(app.getHttpServer())
      .post("/study-sessions")
      .set("Cookie", sessionCookie)
      .send({ setId: "not-a-number" });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("VALIDATION_ERROR");
  });

  it("rejects an unknown or foreign set with 404, leaving the set intact", async () => {
    const unknownResponse = await supertest(app.getHttpServer())
      .post("/study-sessions")
      .set("Cookie", sessionCookie)
      .send({ setId: 99999999 });

    expect(unknownResponse.status).toBe(404);
    expect(unknownResponse.body.code).toBe("SET_NOT_FOUND");

    const foreignResponse = await supertest(app.getHttpServer())
      .post("/study-sessions")
      .set("Cookie", sessionCookie)
      .send({ setId: foreignSetId });

    expect(foreignResponse.status).toBe(404);
    expect(foreignResponse.body.code).toBe("SET_NOT_FOUND");

    const foreignSet = await sets.findById(foreignSetId, ownerId);

    expect(foreignSet).toBeNull();
  });
});

import "reflect-metadata";
import { type INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { eq, users } from "@danisolation-recall/database";
import supertest from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "../app.module";
import { DATABASE_PROVIDER, type Database } from "../database/database.module";
import { hashPassword } from "../auth/password";
import { UsersRepository } from "../auth/users.repository";
import { SetsRepository } from "../sets/sets.repository";
import { CardsRepository } from "./cards.repository";

describe("GET /sets/:id/cards (integration)", () => {
  let app: INestApplication;
  let db: Database;

  const email = "list-cards.integration@example.com";
  const otherEmail = "list-cards.integration.other@example.com";
  const password = "correct horse battery staple";
  let sessionCookie: string;
  let setId: number;
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
    const user = await usersRepository.create({
      email,
      passwordHash: await hashPassword(password),
    });
    const other = await usersRepository.create({
      email: otherEmail,
      passwordHash: await hashPassword(password),
    });

    const setsRepository = app.get(SetsRepository);
    const set = await setsRepository.create(user.id, {
      title: "Card host set",
    });
    setId = set.id;
    const foreignSet = await setsRepository.create(other.id, {
      title: "Foreign set",
    });
    foreignSetId = foreignSet.id;

    const cardsRepository = app.get(CardsRepository);
    await cardsRepository.create(setId, user.id, {
      front: "First front",
      back: "First back",
    });
    await cardsRepository.create(setId, user.id, {
      front: "Second front",
      back: "Second back",
    });
    await cardsRepository.create(setId, user.id, {
      front: "Third front",
      back: "Third back",
    });

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

  it("returns the set's cards in study order", async () => {
    const response = await supertest(app.getHttpServer())
      .get(`/sets/${setId}/cards`)
      .set("Cookie", sessionCookie);

    expect(response.status).toBe(200);
    expect(response.body.items.map((card: { front: string }) => card.front)).toEqual([
      "First front",
      "Second front",
      "Third front",
    ]);
    expect(
      response.body.items.map((card: { position: number }) => card.position),
    ).toEqual([1, 2, 3]);
    expect(response.body.items[0]).toMatchObject({
      id: expect.any(Number),
      setId,
      front: "First front",
      back: "First back",
      position: 1,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
    expect(response.body.nextOffset).toBeNull();
  });

  it("paginates with limit and offset", async () => {
    const pageOne = await supertest(app.getHttpServer())
      .get(`/sets/${setId}/cards`)
      .query({ limit: 2, offset: 0 })
      .set("Cookie", sessionCookie);

    expect(pageOne.status).toBe(200);
    expect(
      pageOne.body.items.map((card: { front: string }) => card.front),
    ).toEqual(["First front", "Second front"]);
    expect(pageOne.body.nextOffset).toBe(2);

    const pageTwo = await supertest(app.getHttpServer())
      .get(`/sets/${setId}/cards`)
      .query({ limit: 2, offset: 2 })
      .set("Cookie", sessionCookie);

    expect(pageTwo.status).toBe(200);
    expect(
      pageTwo.body.items.map((card: { front: string }) => card.front),
    ).toEqual(["Third front"]);
    expect(pageTwo.body.nextOffset).toBeNull();
  });

  it("returns 404 for a missing or foreign set", async () => {
    const foreignResponse = await supertest(app.getHttpServer())
      .get(`/sets/${foreignSetId}/cards`)
      .set("Cookie", sessionCookie);

    expect(foreignResponse.status).toBe(404);
    expect(foreignResponse.body.code).toBe("SET_NOT_FOUND");

    const unknownResponse = await supertest(app.getHttpServer())
      .get("/sets/99999999/cards")
      .set("Cookie", sessionCookie);

    expect(unknownResponse.status).toBe(404);
    expect(unknownResponse.body.code).toBe("SET_NOT_FOUND");
  });

  it("rejects invalid pagination params with 400", async () => {
    const overLimit = await supertest(app.getHttpServer())
      .get(`/sets/${setId}/cards`)
      .query({ limit: 101 })
      .set("Cookie", sessionCookie);

    expect(overLimit.status).toBe(400);
    expect(overLimit.body.code).toBe("VALIDATION_ERROR");

    const negativeOffset = await supertest(app.getHttpServer())
      .get(`/sets/${setId}/cards`)
      .query({ offset: -1 })
      .set("Cookie", sessionCookie);

    expect(negativeOffset.status).toBe(400);
    expect(negativeOffset.body.code).toBe("VALIDATION_ERROR");
  });
});

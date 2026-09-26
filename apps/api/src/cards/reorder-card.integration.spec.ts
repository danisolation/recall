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

describe("PATCH /sets/:id/cards/:cardId/position (integration)", () => {
  let app: INestApplication;
  let db: Database;

  const email = "reorder-card.integration@example.com";
  const otherEmail = "reorder-card.integration.other@example.com";
  const password = "correct horse battery staple";
  let sessionCookie: string;
  let ownerId: number;
  let setId: number;
  let cardAId: number;
  let cardBId: number;
  let cardCId: number;
  let foreignSetId: number;
  let foreignCardId: number;
  let foreignOwnerId: number;

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
    ownerId = user.id;
    const other = await usersRepository.create({
      email: otherEmail,
      passwordHash: await hashPassword(password),
    });
    foreignOwnerId = other.id;

    const setsRepository = app.get(SetsRepository);
    const set = await setsRepository.create(ownerId, {
      title: "Card host set",
    });
    setId = set.id;
    const foreignSet = await setsRepository.create(foreignOwnerId, {
      title: "Foreign set",
    });
    foreignSetId = foreignSet.id;

    const cardsRepository = app.get(CardsRepository);
    const cardA = await cardsRepository.create(setId, ownerId, {
      front: "A",
      back: "a",
    });
    cardAId = cardA!.id;
    const cardB = await cardsRepository.create(setId, ownerId, {
      front: "B",
      back: "b",
    });
    cardBId = cardB!.id;
    const cardC = await cardsRepository.create(setId, ownerId, {
      front: "C",
      back: "c",
    });
    cardCId = cardC!.id;
    const foreignCard = await cardsRepository.create(
      foreignSetId,
      foreignOwnerId,
      {
        front: "Foreign front",
        back: "Foreign back",
      },
    );
    foreignCardId = foreignCard!.id;

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

  async function listFronts(): Promise<string[]> {
    const response = await supertest(app.getHttpServer())
      .get(`/sets/${setId}/cards`)
      .set("Cookie", sessionCookie);

    expect(response.status).toBe(200);

    return response.body.items.map((card: { front: string }) => card.front);
  }

  it("moves a card to the target position and shifts the siblings", async () => {
    const response = await supertest(app.getHttpServer())
      .patch(`/sets/${setId}/cards/${cardAId}/position`)
      .set("Cookie", sessionCookie)
      .send({ position: 2 });

    expect(response.status).toBe(200);
    expect(response.body.front).toBe("A");
    expect(response.body.position).toBe(2);
    expect(await listFronts()).toEqual(["B", "A", "C"]);
  });

  it("clamps an out-of-range target to the set's bounds", async () => {
    const response = await supertest(app.getHttpServer())
      .patch(`/sets/${setId}/cards/${cardBId}/position`)
      .set("Cookie", sessionCookie)
      .send({ position: 99 });

    expect(response.status).toBe(200);
    expect(response.body.position).toBe(3);
    expect(await listFronts()).toEqual(["A", "C", "B"]);
  });

  it("rejects an invalid target with 400", async () => {
    const zero = await supertest(app.getHttpServer())
      .patch(`/sets/${setId}/cards/${cardAId}/position`)
      .set("Cookie", sessionCookie)
      .send({ position: 0 });

    expect(zero.status).toBe(400);
    expect(zero.body.code).toBe("VALIDATION_ERROR");

    const missing = await supertest(app.getHttpServer())
      .patch(`/sets/${setId}/cards/${cardAId}/position`)
      .set("Cookie", sessionCookie)
      .send({});

    expect(missing.status).toBe(400);
    expect(missing.body.code).toBe("VALIDATION_ERROR");
  });

  it("returns 404 for an unknown or malformed card id", async () => {
    const unknownCard = await supertest(app.getHttpServer())
      .patch(`/sets/${setId}/cards/99999999/position`)
      .set("Cookie", sessionCookie)
      .send({ position: 1 });

    expect(unknownCard.status).toBe(404);
    expect(unknownCard.body.code).toBe("CARD_NOT_FOUND");

    const malformedCard = await supertest(app.getHttpServer())
      .patch(`/sets/${setId}/cards/not-a-number/position`)
      .set("Cookie", sessionCookie)
      .send({ position: 1 });

    expect(malformedCard.status).toBe(404);
    expect(malformedCard.body.code).toBe("CARD_NOT_FOUND");
  });

  it("returns 404 for a card in another user's set and leaves the order intact", async () => {
    const response = await supertest(app.getHttpServer())
      .patch(`/sets/${foreignSetId}/cards/${foreignCardId}/position`)
      .set("Cookie", sessionCookie)
      .send({ position: 1 });

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("CARD_NOT_FOUND");

    const cardsRepository = app.get(CardsRepository);
    const foreignCard = await cardsRepository.findById(
      foreignCardId,
      foreignSetId,
      foreignOwnerId,
    );

    expect(foreignCard!.position).toBe(1);
  });
});

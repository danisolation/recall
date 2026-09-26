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

describe("DELETE /sets/:id/cards/:cardId (integration)", () => {
  let app: INestApplication;
  let db: Database;

  const email = "delete-card.integration@example.com";
  const otherEmail = "delete-card.integration.other@example.com";
  const password = "correct horse battery staple";
  let sessionCookie: string;
  let ownerId: number;
  let setId: number;
  let firstCardId: number;
  let secondCardId: number;
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
    const firstCard = await cardsRepository.create(setId, ownerId, {
      front: "First front",
      back: "First back",
    });
    firstCardId = firstCard!.id;
    const secondCard = await cardsRepository.create(setId, ownerId, {
      front: "Second front",
      back: "Second back",
    });
    secondCardId = secondCard!.id;
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

  it("deletes a card with 204 and leaves the remaining card's position unchanged", async () => {
    const response = await supertest(app.getHttpServer())
      .delete(`/sets/${setId}/cards/${firstCardId}`)
      .set("Cookie", sessionCookie);

    expect(response.status).toBe(204);

    const listResponse = await supertest(app.getHttpServer())
      .get(`/sets/${setId}/cards`)
      .set("Cookie", sessionCookie);

    expect(listResponse.status).toBe(200);
    expect(
      listResponse.body.items.map((card: { id: number }) => card.id),
    ).toEqual([secondCardId]);
    expect(listResponse.body.items[0].position).toBe(2);
  });

  it("returns 404 for an unknown card or malformed card id", async () => {
    const unknownCard = await supertest(app.getHttpServer())
      .delete(`/sets/${setId}/cards/99999999`)
      .set("Cookie", sessionCookie);

    expect(unknownCard.status).toBe(404);
    expect(unknownCard.body.code).toBe("CARD_NOT_FOUND");

    const malformedCard = await supertest(app.getHttpServer())
      .delete(`/sets/${setId}/cards/not-a-number`)
      .set("Cookie", sessionCookie);

    expect(malformedCard.status).toBe(404);
    expect(malformedCard.body.code).toBe("CARD_NOT_FOUND");
  });

  it("returns 404 for a card in another user's set and leaves it intact", async () => {
    const response = await supertest(app.getHttpServer())
      .delete(`/sets/${foreignSetId}/cards/${foreignCardId}`)
      .set("Cookie", sessionCookie);

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("CARD_NOT_FOUND");

    const cardsRepository = app.get(CardsRepository);
    const foreignCard = await cardsRepository.findById(
      foreignCardId,
      foreignSetId,
      foreignOwnerId,
    );

    expect(foreignCard!.front).toBe("Foreign front");
  });

  it("returns 404 for a repeat delete", async () => {
    const response = await supertest(app.getHttpServer())
      .delete(`/sets/${setId}/cards/${firstCardId}`)
      .set("Cookie", sessionCookie);

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("CARD_NOT_FOUND");
  });
});

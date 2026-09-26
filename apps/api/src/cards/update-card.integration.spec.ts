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

describe("PATCH /sets/:id/cards/:cardId (integration)", () => {
  let app: INestApplication;
  let db: Database;

  const email = "update-card.integration@example.com";
  const otherEmail = "update-card.integration.other@example.com";
  const password = "correct horse battery staple";
  let sessionCookie: string;
  let ownerId: number;
  let setId: number;
  let cardId: number;
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
    const set = await setsRepository.create(user.id, {
      title: "Card host set",
    });
    setId = set.id;
    const foreignSet = await setsRepository.create(other.id, {
      title: "Foreign set",
    });
    foreignSetId = foreignSet.id;

    const cardsRepository = app.get(CardsRepository);
    const card = await cardsRepository.create(setId, user.id, {
      front: "What is mitosis?",
      back: "Cell division",
    });
    cardId = card!.id;
    const foreignCard = await cardsRepository.create(foreignSetId, other.id, {
      front: "Foreign front",
      back: "Foreign back",
    });
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

  it("updates the front and keeps the back", async () => {
    const cardsRepository = app.get(CardsRepository);
    const before = await cardsRepository.findById(cardId, setId, ownerId);

    const response = await supertest(app.getHttpServer())
      .patch(`/sets/${setId}/cards/${cardId}`)
      .set("Cookie", sessionCookie)
      .send({ front: "  What is osmosis?  " });

    expect(response.status).toBe(200);
    expect(response.body.front).toBe("What is osmosis?");
    expect(response.body.back).toBe("Cell division");
    expect(new Date(response.body.updatedAt).getTime()).toBeGreaterThan(
      new Date(before!.updatedAt).getTime(),
    );
  });

  it("updates the back and keeps the front", async () => {
    const response = await supertest(app.getHttpServer())
      .patch(`/sets/${setId}/cards/${cardId}`)
      .set("Cookie", sessionCookie)
      .send({ back: "  Diffusion of water  " });

    expect(response.status).toBe(200);
    expect(response.body.back).toBe("Diffusion of water");
    expect(response.body.front).toBe("What is osmosis?");
  });

  it("returns 404 for an unknown card or unknown set", async () => {
    const unknownCard = await supertest(app.getHttpServer())
      .patch(`/sets/${setId}/cards/99999999`)
      .set("Cookie", sessionCookie)
      .send({ front: "New front" });

    expect(unknownCard.status).toBe(404);
    expect(unknownCard.body.code).toBe("CARD_NOT_FOUND");

    const unknownSet = await supertest(app.getHttpServer())
      .patch("/sets/99999999/cards/99999999")
      .set("Cookie", sessionCookie)
      .send({ front: "New front" });

    expect(unknownSet.status).toBe(404);
    expect(unknownSet.body.code).toBe("CARD_NOT_FOUND");
  });

  it("returns 404 for a card in another user's set and leaves it intact", async () => {
    const response = await supertest(app.getHttpServer())
      .patch(`/sets/${foreignSetId}/cards/${foreignCardId}`)
      .set("Cookie", sessionCookie)
      .send({ front: "Hijacked front" });

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

  it("returns 404 for a malformed card id", async () => {
    const response = await supertest(app.getHttpServer())
      .patch(`/sets/${setId}/cards/not-a-number`)
      .set("Cookie", sessionCookie)
      .send({ front: "New front" });

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("CARD_NOT_FOUND");
  });

  it("rejects an empty update with 400", async () => {
    const response = await supertest(app.getHttpServer())
      .patch(`/sets/${setId}/cards/${cardId}`)
      .set("Cookie", sessionCookie)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("VALIDATION_ERROR");
  });
});

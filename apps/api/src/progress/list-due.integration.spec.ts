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
import { SessionsRepository } from "../study/sessions.repository";

describe("GET /progress/due (integration)", () => {
  let app: INestApplication;
  let db: Database;

  const dayMs = 24 * 60 * 60 * 1000;
  const ownerEmail = "list-due.integration@example.com";
  const otherEmail = "list-due.integration.other@example.com";
  const password = "correct horse battery staple";
  let ownerCookie: string;
  let otherCookie: string;
  let ownerId: number;
  let otherId: number;
  let sets: SetsRepository;
  let cards: CardsRepository;
  let sessions: SessionsRepository;
  let setId: number;
  let cardBId: number;
  let cardCId: number;
  let cardDId: number;
  let otherCardId: number;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    db = app.get<Database>(DATABASE_PROVIDER);
    await db.delete(users).where(eq(users.email, ownerEmail));
    await db.delete(users).where(eq(users.email, otherEmail));

    const usersRepository = app.get(UsersRepository);
    const owner = await usersRepository.create({
      email: ownerEmail,
      passwordHash: await hashPassword(password),
    });
    ownerId = owner.id;
    const other = await usersRepository.create({
      email: otherEmail,
      passwordHash: await hashPassword(password),
    });
    otherId = other.id;

    sets = app.get(SetsRepository);
    cards = app.get(CardsRepository);
    sessions = app.get(SessionsRepository);

    const set = await sets.create(ownerId, { title: "Due queue set" });
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

    cardBId = cardB.id;
    cardCId = cardC.id;
    cardDId = cardD.id;

    // Three overdue cards, spaced a minute apart to pin the ordering; A is
    // correctly answered recently, so the ladder pushes it into the future.
    const created = await sessions.create(ownerId, setId);
    const t1 = new Date(Date.now() - 2 * dayMs);

    await sessions.addReview(created!.id, ownerId, cardA.id, true, new Date(Date.now() - 30 * 60_000));
    await sessions.addReview(created!.id, ownerId, cardB.id, false, t1);
    await sessions.addReview(
      created!.id,
      ownerId,
      cardC.id,
      false,
      new Date(t1.getTime() + 60_000),
    );
    await sessions.addReview(
      created!.id,
      ownerId,
      cardD.id,
      false,
      new Date(t1.getTime() + 120_000),
    );

    // The foreign user's queue must never reach the owner.
    const otherSet = await sets.create(otherId, { title: "Foreign set" });
    const otherCard = await cards.create(otherSet.id, otherId, {
      front: "Outsider",
      back: "Nope",
    });
    otherCardId = otherCard!.id;
    const otherSession = await sessions.create(otherId, otherSet.id);
    await sessions.addReview(
      otherSession!.id,
      otherId,
      otherCard!.id,
      false,
      new Date(Date.now() - 60 * 60_000),
    );

    const login = async (email: string) => {
      const response = await supertest(app.getHttpServer())
        .post("/auth/login")
        .send({ email, password });

      expect(response.status).toBe(200);

      const setCookie = response.headers["set-cookie"];
      const [cookie] = Array.isArray(setCookie) ? setCookie : [];

      if (!cookie) {
        throw new Error("login did not set a session cookie");
      }

      return cookie;
    };

    ownerCookie = await login(ownerEmail);
    otherCookie = await login(otherEmail);
  });

  afterAll(async () => {
    await db.delete(users).where(eq(users.email, ownerEmail));
    await db.delete(users).where(eq(users.email, otherEmail));
    await app.close();
    await db.$client.end();
  });

  it("returns the due queue most-overdue first with set info", async () => {
    const response = await supertest(app.getHttpServer())
      .get("/progress/due")
      .set("Cookie", ownerCookie);

    expect(response.status).toBe(200);
    expect(response.body.nextOffset).toBeNull();
    expect(
      response.body.items.map((item: { cardId: number }) => item.cardId),
    ).toEqual([cardBId, cardCId, cardDId]);
    expect(response.body.items[0]).toMatchObject({
      cardId: cardBId,
      front: "Front B",
      setId,
      setTitle: "Due queue set",
    });
    expect(new Date(response.body.items[0].nextReviewAt).getTime()).toBeLessThan(
      Date.now(),
    );
  });

  it("paginates with nextOffset transitions", async () => {
    const firstPage = await supertest(app.getHttpServer())
      .get("/progress/due")
      .query({ limit: 2 })
      .set("Cookie", ownerCookie);

    expect(firstPage.status).toBe(200);
    expect(
      firstPage.body.items.map((item: { cardId: number }) => item.cardId),
    ).toEqual([cardBId, cardCId]);
    expect(firstPage.body.nextOffset).toBe(2);

    const secondPage = await supertest(app.getHttpServer())
      .get("/progress/due")
      .query({ limit: 2, offset: 2 })
      .set("Cookie", ownerCookie);

    expect(secondPage.status).toBe(200);
    expect(
      secondPage.body.items.map((item: { cardId: number }) => item.cardId),
    ).toEqual([cardDId]);
    expect(secondPage.body.nextOffset).toBeNull();
  });

  it("excludes a foreign user's due cards", async () => {
    const response = await supertest(app.getHttpServer())
      .get("/progress/due")
      .set("Cookie", ownerCookie);

    expect(
      response.body.items.some(
        (item: { cardId: number }) => item.cardId === otherCardId,
      ),
    ).toBe(false);

    const otherResponse = await supertest(app.getHttpServer())
      .get("/progress/due")
      .set("Cookie", otherCookie);

    expect(otherResponse.body.items).toHaveLength(1);
    expect(otherResponse.body.items[0]).toMatchObject({
      cardId: otherCardId,
      front: "Outsider",
      setTitle: "Foreign set",
    });
  });

  it("rejects invalid query values with 400", async () => {
    const overLimit = await supertest(app.getHttpServer())
      .get("/progress/due")
      .query({ limit: 101 })
      .set("Cookie", ownerCookie);

    expect(overLimit.status).toBe(400);
    expect(overLimit.body.code).toBe("VALIDATION_ERROR");

    const negativeOffset = await supertest(app.getHttpServer())
      .get("/progress/due")
      .query({ offset: -1 })
      .set("Cookie", ownerCookie);

    expect(negativeOffset.status).toBe(400);
    expect(negativeOffset.body.code).toBe("VALIDATION_ERROR");
  });

  it("rejects a request without a session cookie with 401", async () => {
    const response = await supertest(app.getHttpServer()).get("/progress/due");

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("UNAUTHENTICATED");
  });
});

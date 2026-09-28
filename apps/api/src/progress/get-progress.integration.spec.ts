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

describe("GET /progress (integration)", () => {
  let app: INestApplication;
  let db: Database;

  const dayMs = 24 * 60 * 60 * 1000;
  const ownerEmail = "get-progress.integration@example.com";
  const emptyEmail = "get-progress.integration.empty@example.com";
  const lapsedEmail = "get-progress.integration.lapsed@example.com";
  const password = "correct horse battery staple";
  let ownerCookie: string;
  let emptyCookie: string;
  let lapsedCookie: string;
  let sets: SetsRepository;
  let cards: CardsRepository;
  let sessions: SessionsRepository;
  let setId: number;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    db = app.get<Database>(DATABASE_PROVIDER);
    await db.delete(users).where(eq(users.email, ownerEmail));
    await db.delete(users).where(eq(users.email, emptyEmail));
    await db.delete(users).where(eq(users.email, lapsedEmail));

    const usersRepository = app.get(UsersRepository);
    const owner = await usersRepository.create({
      email: ownerEmail,
      passwordHash: await hashPassword(password),
    });
    await usersRepository.create({
      email: emptyEmail,
      passwordHash: await hashPassword(password),
    });
    // ADR-016: a three-day run that ended two days ago — a lapsed current
    // streak (0) with the run still on record as the longest (3).
    const lapsed = await usersRepository.create({
      email: lapsedEmail,
      passwordHash: await hashPassword(password),
    });

    sets = app.get(SetsRepository);
    cards = app.get(CardsRepository);
    sessions = app.get(SessionsRepository);

    const set = await sets.create(owner.id, { title: "Get progress set" });
    setId = set.id;

    const cardA = await cards.create(setId, owner.id, {
      front: "Front A",
      back: "Back A",
    });
    const cardB = await cards.create(setId, owner.id, {
      front: "Front B",
      back: "Back B",
    });
    const cardC = await cards.create(setId, owner.id, {
      front: "Front C",
      back: "Back C",
    });

    if (!cardA || !cardB || !cardC) {
      throw new Error("Failed to create test cards");
    }

    // The lapsed user's own set and card — separate rows, so the run below
    // exercises the session join's ownership filter rather than the owner's.
    const lapsedSet = await sets.create(lapsed.id, { title: "Lapsed set" });
    const lapsedCard = await cards.create(lapsedSet.id, lapsed.id, {
      front: "Lapsed front",
      back: "Lapsed back",
    });

    if (!lapsedCard) {
      throw new Error("Failed to create the lapsed test card");
    }

    // Seeded relative to the real clock so "due" comparisons stay stable:
    // A walks the ladder into the future, B and C stay overdue.
    const t1 = new Date(Date.now() - 2 * dayMs);
    const ownerId = owner.id;

    const first = await sessions.create(ownerId, setId);
    await sessions.addReview(first!.id, ownerId, cardA.id, true, t1);
    await sessions.addReview(
      first!.id,
      ownerId,
      cardB.id,
      false,
      new Date(t1.getTime() + 60_000),
    );
    await sessions.addReview(
      first!.id,
      ownerId,
      cardC.id,
      false,
      new Date(t1.getTime() + 120_000),
    );

    const second = await sessions.create(ownerId, setId);
    await sessions.addReview(
      second!.id,
      ownerId,
      cardA.id,
      true,
      new Date(Date.now() - 60 * 60_000),
    );

    // Three consecutive practice days, the most recent two days ago, so the
    // run is behind the grace window: currentStreak 0, longestStreak 3.
    for (const daysAgo of [4, 3, 2]) {
      const lapsedSession = await sessions.create(lapsed.id, lapsedSet.id);
      await sessions.addReview(
        lapsedSession!.id,
        lapsed.id,
        lapsedCard.id,
        true,
        new Date(Date.now() - daysAgo * dayMs),
      );
    }

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
    emptyCookie = await login(emptyEmail);
    lapsedCookie = await login(lapsedEmail);
  });

  afterAll(async () => {
    await db.delete(users).where(eq(users.email, ownerEmail));
    await db.delete(users).where(eq(users.email, emptyEmail));
    await db.delete(users).where(eq(users.email, lapsedEmail));
    await app.close();
    await db.$client.end();
  });

  it("returns the caller's review counts, due count, and streaks", async () => {
    const response = await supertest(app.getHttpServer())
      .get("/progress")
      .set("Cookie", ownerCookie);

    expect(response.status).toBe(200);
    // Exact shape: counts only — there is no server-computed accuracy
    // (ADR-010) — plus the two derived streak facts (ADR-016). The owner's
    // reviews land today and two days ago, so today's practice starts a
    // new run: current 1, longest 1.
    expect(response.body).toEqual({
      totalReviews: 4,
      correctReviews: 2,
      dueCount: 2,
      currentStreak: 1,
      longestStreak: 1,
    });
  });

  it("gives a zero-review user a zeroed summary", async () => {
    const response = await supertest(app.getHttpServer())
      .get("/progress")
      .set("Cookie", emptyCookie);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      totalReviews: 0,
      correctReviews: 0,
      dueCount: 0,
      currentStreak: 0,
      longestStreak: 0,
    });
  });

  // ADR-016's grace rule at the HTTP boundary: a run that ended before
  // yesterday is no longer current, but it is still the best run ever.
  it("zeroes a lapsed current streak while keeping the longest run", async () => {
    const response = await supertest(app.getHttpServer())
      .get("/progress")
      .set("Cookie", lapsedCookie);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      currentStreak: 0,
      longestStreak: 3,
    });
  });

  it("rejects a request without a session cookie with 401", async () => {
    const response = await supertest(app.getHttpServer()).get("/progress");

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("UNAUTHENTICATED");
  });
});

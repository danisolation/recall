import "reflect-metadata";
import { type INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { eq, users } from "@danisolation-recall/database";
import supertest from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "../app.module";
import { hashPassword } from "../auth/password";
import { UsersRepository } from "../auth/users.repository";
import { DATABASE_PROVIDER, type Database } from "../database/database.module";
import { SetsRepository } from "../sets/sets.repository";
import { SessionsRepository } from "./sessions.repository";

describe("GET /study-sessions (integration)", () => {
  let app: INestApplication;
  let db: Database;

  const ownerEmail = "list-sessions.integration@example.com";
  const otherEmail = "list-sessions.integration.other@example.com";
  const password = "correct horse battery staple";
  let ownerCookie: string;
  let otherCookie: string;
  let ownerId: number;
  let otherSessionId: number;
  let sets: SetsRepository;
  let sessions: SessionsRepository;
  let setId: number;
  let sessionIds: number[] = [];

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

    sets = app.get(SetsRepository);
    sessions = app.get(SessionsRepository);

    const set = await sets.create(ownerId, { title: "History set" });
    setId = set.id;

    for (let index = 0; index < 3; index += 1) {
      const created = await sessions.create(ownerId, setId);
      sessionIds.push(created!.id);
    }

    const otherSet = await sets.create(other.id, { title: "Foreign set" });
    const otherSession = await sessions.create(other.id, otherSet.id);
    otherSessionId = otherSession!.id;

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

  it("returns the caller's sessions newest first with set titles", async () => {
    const response = await supertest(app.getHttpServer())
      .get("/study-sessions")
      .set("Cookie", ownerCookie);

    expect(response.status).toBe(200);
    expect(response.body.items.map((item: { id: number }) => item.id)).toEqual(
      [sessionIds[2], sessionIds[1], sessionIds[0]],
    );
    expect(response.body.items[0]).toMatchObject({
      id: sessionIds[2],
      userId: ownerId,
      setId,
      setTitle: "History set",
      status: "ACTIVE",
      finishedAt: null,
    });
    expect(response.body.nextOffset).toBeNull();
  });

  it("slices with limit and offset and reports nextOffset transitions", async () => {
    const firstPage = await supertest(app.getHttpServer())
      .get("/study-sessions")
      .query({ limit: 2 })
      .set("Cookie", ownerCookie);

    expect(firstPage.status).toBe(200);
    expect(
      firstPage.body.items.map((item: { id: number }) => item.id),
    ).toEqual([sessionIds[2], sessionIds[1]]);
    expect(firstPage.body.nextOffset).toBe(2);

    const secondPage = await supertest(app.getHttpServer())
      .get("/study-sessions")
      .query({ limit: 2, offset: 2 })
      .set("Cookie", ownerCookie);

    expect(secondPage.status).toBe(200);
    expect(
      secondPage.body.items.map((item: { id: number }) => item.id),
    ).toEqual([sessionIds[0]]);
    expect(secondPage.body.nextOffset).toBeNull();
  });

  it("excludes other users' sessions in both directions", async () => {
    const ownerList = await supertest(app.getHttpServer())
      .get("/study-sessions")
      .set("Cookie", ownerCookie);

    expect(
      ownerList.body.items.some(
        (item: { id: number }) => item.id === otherSessionId,
      ),
    ).toBe(false);

    const otherList = await supertest(app.getHttpServer())
      .get("/study-sessions")
      .set("Cookie", otherCookie);

    expect(
      otherList.body.items.map((item: { id: number }) => item.id),
    ).toEqual([otherSessionId]);
    expect(otherList.body.items[0]).toMatchObject({
      setTitle: "Foreign set",
    });
  });

  it("rejects invalid query values with 400", async () => {
    const overLimit = await supertest(app.getHttpServer())
      .get("/study-sessions")
      .query({ limit: 101 })
      .set("Cookie", ownerCookie);

    expect(overLimit.status).toBe(400);
    expect(overLimit.body.code).toBe("VALIDATION_ERROR");

    const negativeOffset = await supertest(app.getHttpServer())
      .get("/study-sessions")
      .query({ offset: -1 })
      .set("Cookie", ownerCookie);

    expect(negativeOffset.status).toBe(400);
    expect(negativeOffset.body.code).toBe("VALIDATION_ERROR");
  });

  it("rejects a request without a session cookie with 401", async () => {
    const response = await supertest(app.getHttpServer()).get("/study-sessions");

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("UNAUTHENTICATED");
  });
});

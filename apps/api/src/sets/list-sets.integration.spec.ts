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
import { SetsRepository } from "./sets.repository";

describe("GET /sets (integration)", () => {
  let app: INestApplication;
  let db: Database;

  const email = "list-sets.integration@example.com";
  const otherEmail = "list-sets.other@example.com";
  const searchEmail = "list-sets.search@example.com";
  const password = "correct horse battery staple";
  let sessionCookie: string;
  let searchCookie: string;
  let ownerId: number;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    db = app.get<Database>(DATABASE_PROVIDER);
    await db.delete(users).where(eq(users.email, email));
    await db.delete(users).where(eq(users.email, otherEmail));
    await db.delete(users).where(eq(users.email, searchEmail));

    const usersRepository = app.get(UsersRepository);
    const owner = await usersRepository.create({
      email,
      passwordHash: await hashPassword(password),
    });
    const other = await usersRepository.create({
      email: otherEmail,
      passwordHash: "hashed",
    });
    const searchUser = await usersRepository.create({
      email: searchEmail,
      passwordHash: await hashPassword(password),
    });
    ownerId = owner.id;

    const setsRepository = app.get(SetsRepository);
    await setsRepository.create(ownerId, { title: "List A" });
    await setsRepository.create(ownerId, { title: "List B" });
    await setsRepository.create(ownerId, { title: "List C" });
    await setsRepository.create(other.id, { title: "Intruder set" });

    // A separate library for the search tests, so the exact-list assertions
    // above and below stay untouched by the extra fixtures.
    await setsRepository.create(searchUser.id, {
      title: "Biology basics",
      description: "Cells and organelles",
    });
    await setsRepository.create(searchUser.id, {
      title: "History of Rome",
      description: "The republic and its emperors",
    });
    await setsRepository.create(searchUser.id, {
      title: "Advanced biology",
      description: "Genetics",
    });

    const login = async (userEmail: string) => {
      const response = await supertest(app.getHttpServer())
        .post("/auth/login")
        .send({ email: userEmail, password });

      expect(response.status).toBe(200);

      const setCookie = response.headers["set-cookie"];
      const [cookie] = Array.isArray(setCookie) ? setCookie : [];

      if (!cookie) {
        throw new Error("login did not set a session cookie");
      }

      return cookie;
    };

    sessionCookie = await login(email);
    searchCookie = await login(searchEmail);
  });

  afterAll(async () => {
    await db.delete(users).where(eq(users.email, email));
    await db.delete(users).where(eq(users.email, otherEmail));
    await db.delete(users).where(eq(users.email, searchEmail));
    await app.close();
    await db.$client.end();
  });

  it("returns the caller's sets newest first", async () => {
    const response = await supertest(app.getHttpServer())
      .get("/sets")
      .set("Cookie", sessionCookie);

    expect(response.status).toBe(200);
    expect(response.body.items.map((set: { title: string }) => set.title)).toEqual([
      "List C",
      "List B",
      "List A",
    ]);
    expect(response.body.items[0]).toMatchObject({
      id: expect.any(Number),
      ownerId,
      title: "List C",
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
    expect(response.body.nextOffset).toBeNull();
  });

  it("paginates with limit and offset", async () => {
    const pageOne = await supertest(app.getHttpServer())
      .get("/sets")
      .query({ limit: 2, offset: 0 })
      .set("Cookie", sessionCookie);

    expect(pageOne.status).toBe(200);
    expect(pageOne.body.items.map((set: { title: string }) => set.title)).toEqual([
      "List C",
      "List B",
    ]);
    expect(pageOne.body.nextOffset).toBe(2);

    const pageTwo = await supertest(app.getHttpServer())
      .get("/sets")
      .query({ limit: 2, offset: 2 })
      .set("Cookie", sessionCookie);

    expect(pageTwo.status).toBe(200);
    expect(pageTwo.body.items.map((set: { title: string }) => set.title)).toEqual([
      "List A",
    ]);
    expect(pageTwo.body.nextOffset).toBeNull();
  });

  it("excludes another user's sets", async () => {
    const response = await supertest(app.getHttpServer())
      .get("/sets")
      .set("Cookie", sessionCookie);

    expect(response.status).toBe(200);
    expect(
      response.body.items.map((set: { title: string }) => set.title),
    ).not.toContain("Intruder set");
  });

  it("rejects invalid pagination params with 400", async () => {
    const overLimit = await supertest(app.getHttpServer())
      .get("/sets")
      .query({ limit: 101 })
      .set("Cookie", sessionCookie);

    expect(overLimit.status).toBe(400);
    expect(overLimit.body.code).toBe("VALIDATION_ERROR");

    const negativeOffset = await supertest(app.getHttpServer())
      .get("/sets")
      .query({ offset: -1 })
      .set("Cookie", sessionCookie);

    expect(negativeOffset.status).toBe(400);
    expect(negativeOffset.body.code).toBe("VALIDATION_ERROR");
  });

  it("matches titles case-insensitively", async () => {
    const response = await supertest(app.getHttpServer())
      .get("/sets")
      .query({ q: "BIOLOGY" })
      .set("Cookie", searchCookie);

    expect(response.status).toBe(200);
    expect(
      response.body.items.map((set: { title: string }) => set.title),
    ).toEqual(["Advanced biology", "Biology basics"]);
  });

  it("matches descriptions too", async () => {
    const response = await supertest(app.getHttpServer())
      .get("/sets")
      .query({ q: "organelles" })
      .set("Cookie", searchCookie);

    expect(response.status).toBe(200);
    expect(
      response.body.items.map((set: { title: string }) => set.title),
    ).toEqual(["Biology basics"]);
  });

  it("returns an empty page for a query nothing matches", async () => {
    const response = await supertest(app.getHttpServer())
      .get("/sets")
      .query({ q: "chemistry" })
      .set("Cookie", searchCookie);

    expect(response.status).toBe(200);
    expect(response.body.items).toEqual([]);
    expect(response.body.nextOffset).toBeNull();
  });

  it("never returns another user's sets, whatever the query", async () => {
    const response = await supertest(app.getHttpServer())
      .get("/sets")
      .query({ q: "List" })
      .set("Cookie", searchCookie);

    expect(response.status).toBe(200);
    expect(
      response.body.items.map((set: { title: string }) => set.title),
    ).toEqual([]);
  });

  it("composes the filter with pagination", async () => {
    const firstPage = await supertest(app.getHttpServer())
      .get("/sets")
      .query({ q: "biology", limit: 1 })
      .set("Cookie", searchCookie);

    expect(firstPage.status).toBe(200);
    expect(
      firstPage.body.items.map((set: { title: string }) => set.title),
    ).toEqual(["Advanced biology"]);
    expect(firstPage.body.nextOffset).toBe(1);

    // A full page always advertises a next offset (SET-005: no COUNT(*));
    // the empty third page is where the queue ends.
    const secondPage = await supertest(app.getHttpServer())
      .get("/sets")
      .query({ q: "biology", limit: 1, offset: 1 })
      .set("Cookie", searchCookie);

    expect(secondPage.status).toBe(200);
    expect(
      secondPage.body.items.map((set: { title: string }) => set.title),
    ).toEqual(["Biology basics"]);
    expect(secondPage.body.nextOffset).toBe(2);

    const thirdPage = await supertest(app.getHttpServer())
      .get("/sets")
      .query({ q: "biology", limit: 1, offset: 2 })
      .set("Cookie", searchCookie);

    expect(thirdPage.status).toBe(200);
    expect(thirdPage.body.items).toEqual([]);
    expect(thirdPage.body.nextOffset).toBeNull();
  });

  it("treats LIKE metacharacters in the query literally", async () => {
    // An unescaped % would match every set; escaping makes it literal.
    const percent = await supertest(app.getHttpServer())
      .get("/sets")
      .query({ q: "%" })
      .set("Cookie", searchCookie);

    expect(percent.status).toBe(200);
    expect(percent.body.items).toEqual([]);

    const underscore = await supertest(app.getHttpServer())
      .get("/sets")
      .query({ q: "Biology_basics" })
      .set("Cookie", searchCookie);

    expect(underscore.status).toBe(200);
    expect(underscore.body.items).toEqual([]);
  });

  it("treats an empty or whitespace query as no filter", async () => {
    const empty = await supertest(app.getHttpServer())
      .get("/sets")
      .query({ q: "" })
      .set("Cookie", searchCookie);

    expect(empty.status).toBe(200);
    expect(empty.body.items).toHaveLength(3);

    const whitespace = await supertest(app.getHttpServer())
      .get("/sets")
      .query({ q: "   " })
      .set("Cookie", searchCookie);

    expect(whitespace.status).toBe(200);
    expect(whitespace.body.items).toHaveLength(3);
  });

  it("rejects an over-long query with 400", async () => {
    const response = await supertest(app.getHttpServer())
      .get("/sets")
      .query({ q: "a".repeat(201) })
      .set("Cookie", searchCookie);

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("VALIDATION_ERROR");
  });
});

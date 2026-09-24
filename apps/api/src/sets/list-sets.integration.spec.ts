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
  const password = "correct horse battery staple";
  let sessionCookie: string;
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

    const usersRepository = app.get(UsersRepository);
    const owner = await usersRepository.create({
      email,
      passwordHash: await hashPassword(password),
    });
    const other = await usersRepository.create({
      email: otherEmail,
      passwordHash: "hashed",
    });
    ownerId = owner.id;

    const setsRepository = app.get(SetsRepository);
    await setsRepository.create(ownerId, { title: "List A" });
    await setsRepository.create(ownerId, { title: "List B" });
    await setsRepository.create(ownerId, { title: "List C" });
    await setsRepository.create(other.id, { title: "Intruder set" });

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
});

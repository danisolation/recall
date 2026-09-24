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

describe("GET /sets/:id (integration)", () => {
  let app: INestApplication;
  let db: Database;

  const email = "get-set.integration@example.com";
  const otherEmail = "get-set.other@example.com";
  const password = "correct horse battery staple";
  let sessionCookie: string;
  let ownedSetId: number;
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
    const other = await usersRepository.create({
      email: otherEmail,
      passwordHash: "hashed",
    });

    const setsRepository = app.get(SetsRepository);
    const ownedSet = await setsRepository.create(owner.id, {
      title: "Owned set",
      description: "Mine",
    });
    const foreignSet = await setsRepository.create(other.id, {
      title: "Foreign set",
    });
    ownedSetId = ownedSet.id;
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

  it("returns the set to its owner", async () => {
    const response = await supertest(app.getHttpServer())
      .get(`/sets/${ownedSetId}`)
      .set("Cookie", sessionCookie);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: ownedSetId,
      title: "Owned set",
      description: "Mine",
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  it("returns 404 for a missing set", async () => {
    const response = await supertest(app.getHttpServer())
      .get("/sets/99999999")
      .set("Cookie", sessionCookie);

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("SET_NOT_FOUND");
  });

  it("returns 404 for a malformed id", async () => {
    const response = await supertest(app.getHttpServer())
      .get("/sets/not-a-number")
      .set("Cookie", sessionCookie);

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("SET_NOT_FOUND");
  });

  it("returns 404 for another user's set", async () => {
    const response = await supertest(app.getHttpServer())
      .get(`/sets/${foreignSetId}`)
      .set("Cookie", sessionCookie);

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("SET_NOT_FOUND");
  });
});

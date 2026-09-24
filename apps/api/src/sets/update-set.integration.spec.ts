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

describe("PATCH /sets/:id (integration)", () => {
  let app: INestApplication;
  let db: Database;

  const email = "update-set.integration@example.com";
  const otherEmail = "update-set.other@example.com";
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
      title: "Before title",
      description: "Before description",
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

  it("updates the title and keeps the description", async () => {
    const response = await supertest(app.getHttpServer())
      .patch(`/sets/${ownedSetId}`)
      .set("Cookie", sessionCookie)
      .send({ title: "After title" });

    expect(response.status).toBe(200);
    expect(response.body.title).toBe("After title");
    expect(response.body.description).toBe("Before description");
    expect(new Date(response.body.updatedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(response.body.createdAt).getTime(),
    );
  });

  it("updates the description and keeps the title", async () => {
    const response = await supertest(app.getHttpServer())
      .patch(`/sets/${ownedSetId}`)
      .set("Cookie", sessionCookie)
      .send({ description: "After description" });

    expect(response.status).toBe(200);
    expect(response.body.title).toBe("After title");
    expect(response.body.description).toBe("After description");
  });

  it("trims the updated values", async () => {
    const response = await supertest(app.getHttpServer())
      .patch(`/sets/${ownedSetId}`)
      .set("Cookie", sessionCookie)
      .send({ title: "  Padded title  " });

    expect(response.status).toBe(200);
    expect(response.body.title).toBe("Padded title");
  });

  it("returns 404 for a missing set", async () => {
    const response = await supertest(app.getHttpServer())
      .patch("/sets/99999999")
      .set("Cookie", sessionCookie)
      .send({ title: "New title" });

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("SET_NOT_FOUND");
  });

  it("returns 404 for another user's set", async () => {
    const response = await supertest(app.getHttpServer())
      .patch(`/sets/${foreignSetId}`)
      .set("Cookie", sessionCookie)
      .send({ title: "Hijacked title" });

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("SET_NOT_FOUND");
  });

  it("rejects an empty update with 400", async () => {
    const response = await supertest(app.getHttpServer())
      .patch(`/sets/${ownedSetId}`)
      .set("Cookie", sessionCookie)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("VALIDATION_ERROR");
  });
});

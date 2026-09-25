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

describe("POST /sets/:id/cards (integration)", () => {
  let app: INestApplication;
  let db: Database;

  const email = "create-card.integration@example.com";
  const otherEmail = "create-card.integration.other@example.com";
  const password = "correct horse battery staple";
  let sessionCookie: string;
  let setId: number;
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
    const user = await usersRepository.create({
      email,
      passwordHash: await hashPassword(password),
    });
    const other = await usersRepository.create({
      email: otherEmail,
      passwordHash: await hashPassword(password),
    });

    const setsRepository = app.get(SetsRepository);
    const set = await setsRepository.create(user.id, {
      title: "Card host set",
    });
    setId = set.id;
    const foreignSet = await setsRepository.create(other.id, {
      title: "Foreign set",
    });
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

  it("creates a card in the authenticated user's set", async () => {
    const response = await supertest(app.getHttpServer())
      .post(`/sets/${setId}/cards`)
      .set("Cookie", sessionCookie)
      .send({ front: "  What is mitosis?  ", back: "Cell division" });

    expect(response.status).toBe(201);
    expect(response.body.setId).toBe(setId);
    expect(response.body.front).toBe("What is mitosis?");
    expect(response.body.back).toBe("Cell division");
    expect(response.body.position).toBe(1);
    expect(response.body.createdAt).toBeTruthy();
    expect(response.body.updatedAt).toBeTruthy();
  });

  it("appends after existing cards", async () => {
    const response = await supertest(app.getHttpServer())
      .post(`/sets/${setId}/cards`)
      .set("Cookie", sessionCookie)
      .send({ front: "Second front", back: "Second back" });

    expect(response.status).toBe(201);
    expect(response.body.position).toBe(2);
  });

  it("rejects a request without a session cookie with 401", async () => {
    const response = await supertest(app.getHttpServer())
      .post(`/sets/${setId}/cards`)
      .send({ front: "Front", back: "Back" });

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("UNAUTHENTICATED");
  });

  it("rejects invalid input with 400", async () => {
    const response = await supertest(app.getHttpServer())
      .post(`/sets/${setId}/cards`)
      .set("Cookie", sessionCookie)
      .send({ front: "", back: "Back" });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("VALIDATION_ERROR");
  });

  it("returns 404 for an unknown set", async () => {
    const response = await supertest(app.getHttpServer())
      .post("/sets/99999999/cards")
      .set("Cookie", sessionCookie)
      .send({ front: "Front", back: "Back" });

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("SET_NOT_FOUND");
  });

  it("returns 404 for a malformed set id", async () => {
    const response = await supertest(app.getHttpServer())
      .post("/sets/not-a-number/cards")
      .set("Cookie", sessionCookie)
      .send({ front: "Front", back: "Back" });

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("SET_NOT_FOUND");
  });

  it("returns 404 for another user's set and leaves it intact", async () => {
    const response = await supertest(app.getHttpServer())
      .post(`/sets/${foreignSetId}/cards`)
      .set("Cookie", sessionCookie)
      .send({ front: "Stolen", back: "Nope" });

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("SET_NOT_FOUND");
  });
});

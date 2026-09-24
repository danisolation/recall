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

describe("POST /sets (integration)", () => {
  let app: INestApplication;
  let db: Database;

  const email = "create-set.integration@example.com";
  const password = "correct horse battery staple";
  let sessionCookie: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    db = app.get<Database>(DATABASE_PROVIDER);
    await db.delete(users).where(eq(users.email, email));

    const usersRepository = app.get(UsersRepository);
    await usersRepository.create({
      email,
      passwordHash: await hashPassword(password),
    });

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
    await app.close();
    await db.$client.end();
  });

  it("creates a set for the authenticated user", async () => {
    const response = await supertest(app.getHttpServer())
      .post("/sets")
      .set("Cookie", sessionCookie)
      .send({ title: "  Biology basics  ", description: "Cells" });

    expect(response.status).toBe(201);
    expect(response.body.id).toBeGreaterThan(0);
    expect(response.body.ownerId).toBeGreaterThan(0);
    expect(response.body.title).toBe("Biology basics");
    expect(response.body.description).toBe("Cells");
    expect(response.body.createdAt).toBeTruthy();
    expect(response.body.updatedAt).toBeTruthy();
  });

  it("rejects a request without a session cookie with 401", async () => {
    const response = await supertest(app.getHttpServer())
      .post("/sets")
      .send({ title: "Biology basics" });

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("UNAUTHENTICATED");
  });

  it("rejects invalid input with 400", async () => {
    const response = await supertest(app.getHttpServer())
      .post("/sets")
      .set("Cookie", sessionCookie)
      .send({ title: "" });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("VALIDATION_ERROR");
  });
});

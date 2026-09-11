import "reflect-metadata";
import { type INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { eq, users } from "@danisolation-recall/database";
import supertest from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "../app.module";
import { DATABASE_PROVIDER, type Database } from "../database/database.module";
import { hashPassword } from "./password";
import { UsersRepository } from "./users.repository";

describe("POST /auth/login (integration)", () => {
  let app: INestApplication;
  let db: Database;

  const email = "login.integration@example.com";
  const password = "correct horse battery staple";

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
  });

  afterAll(async () => {
    await db.delete(users).where(eq(users.email, email));
    await app.close();
    await db.$client.end();
  });

  it("authenticates valid credentials", async () => {
    const response = await supertest(app.getHttpServer())
      .post("/auth/login")
      .send({ email, password });

    expect(response.status).toBe(200);
    expect(response.body.email).toBe(email);
    expect(response.body.id).toBeGreaterThan(0);
    expect("passwordHash" in response.body).toBe(false);
  });

  it("rejects a wrong password with 401", async () => {
    const response = await supertest(app.getHttpServer())
      .post("/auth/login")
      .send({ email, password: "definitely not the password" });

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("INVALID_CREDENTIALS");
  });

  it("rejects an unknown email with 401", async () => {
    const response = await supertest(app.getHttpServer())
      .post("/auth/login")
      .send({ email: "unknown@example.com", password });

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("INVALID_CREDENTIALS");
  });

  it("rejects invalid input with 400", async () => {
    const response = await supertest(app.getHttpServer())
      .post("/auth/login")
      .send({ email: "not-an-email", password: "" });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("VALIDATION_ERROR");
  });
});

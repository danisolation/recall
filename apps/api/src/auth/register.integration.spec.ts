import "reflect-metadata";
import { type INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { eq, users } from "@danisolation-recall/database";
import supertest from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "../app.module";
import { DATABASE_PROVIDER, type Database } from "../database/database.module";

describe("POST /auth/register (integration)", () => {
  let app: INestApplication;
  let db: Database;

  const email = "register.integration@example.com";
  const password = "correct horse battery staple";

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    db = app.get<Database>(DATABASE_PROVIDER);
    await db.delete(users).where(eq(users.email, email));
  });

  afterAll(async () => {
    await db.delete(users).where(eq(users.email, email));
    await app.close();
    await db.$client.end();
  });

  it("creates a user for valid input", async () => {
    const response = await supertest(app.getHttpServer())
      .post("/auth/register")
      .send({ email, password });

    expect(response.status).toBe(201);
    expect(response.body.email).toBe(email);
    expect("passwordHash" in response.body).toBe(false);
  });

  it("rejects a duplicate email with 409", async () => {
    const response = await supertest(app.getHttpServer())
      .post("/auth/register")
      .send({ email, password });

    expect(response.status).toBe(409);
    expect(response.body.code).toBe("EMAIL_ALREADY_REGISTERED");
  });

  it("rejects invalid input with 400", async () => {
    const response = await supertest(app.getHttpServer())
      .post("/auth/register")
      .send({ email: "not-an-email", password: "short" });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("VALIDATION_ERROR");
  });
});

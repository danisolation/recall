import "reflect-metadata";
import { type INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { eq, users } from "@danisolation-recall/database";
import supertest from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "../app.module";
import { DATABASE_PROVIDER, type Database } from "../database/database.module";
import { hashPassword } from "./password";
import { SESSION_COOKIE_NAME } from "./session";
import { UsersRepository } from "./users.repository";

describe("GET /auth/me (integration)", () => {
  let app: INestApplication;
  let db: Database;

  const email = "protected.integration@example.com";
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

  it("rejects a request without a session cookie with 401", async () => {
    const response = await supertest(app.getHttpServer()).get("/auth/me");

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("UNAUTHENTICATED");
  });

  it("rejects a request with an invalid session cookie with 401", async () => {
    const response = await supertest(app.getHttpServer())
      .get("/auth/me")
      .set("Cookie", `${SESSION_COOKIE_NAME}=not-a-real-token`);

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("UNAUTHENTICATED");
  });

  it("returns the current user for a valid session cookie", async () => {
    const loginResponse = await supertest(app.getHttpServer())
      .post("/auth/login")
      .send({ email, password });

    expect(loginResponse.status).toBe(200);

    const setCookie = loginResponse.headers["set-cookie"];
    const [sessionCookie] = Array.isArray(setCookie) ? setCookie : [];

    if (!sessionCookie) {
      throw new Error("login did not set a session cookie");
    }

    const response = await supertest(app.getHttpServer())
      .get("/auth/me")
      .set("Cookie", sessionCookie);

    expect(response.status).toBe(200);
    expect(response.body.email).toBe(email);
    expect(response.body.id).toBeGreaterThan(0);
    expect("passwordHash" in response.body).toBe(false);
  });

  it("sets the session cookie with the flags required by ADR-007", async () => {
    const loginResponse = await supertest(app.getHttpServer())
      .post("/auth/login")
      .send({ email, password });

    const setCookie = loginResponse.headers["set-cookie"];
    const [sessionCookie] = Array.isArray(setCookie) ? setCookie : [];

    if (!sessionCookie) {
      throw new Error("login did not set a session cookie");
    }

    expect(sessionCookie).toContain("HttpOnly");
    expect(sessionCookie).toContain("SameSite=Lax");
    expect(sessionCookie).toContain("Expires=");
  });
});

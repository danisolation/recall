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

describe("POST /auth/logout (integration)", () => {
  let app: INestApplication;
  let db: Database;

  const email = "logout.integration@example.com";
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

  async function login(): Promise<string> {
    const loginResponse = await supertest(app.getHttpServer())
      .post("/auth/login")
      .send({ email, password });

    const setCookie = loginResponse.headers["set-cookie"];
    const [sessionCookie] = Array.isArray(setCookie) ? setCookie : [];

    if (!sessionCookie) {
      throw new Error("login did not set a session cookie");
    }

    return sessionCookie;
  }

  it("rejects a logout without a session cookie with 401", async () => {
    const response = await supertest(app.getHttpServer()).post("/auth/logout");

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("UNAUTHENTICATED");
  });

  it("revokes the session and clears the cookie", async () => {
    const sessionCookie = await login();

    const logoutResponse = await supertest(app.getHttpServer())
      .post("/auth/logout")
      .set("Cookie", sessionCookie);

    expect(logoutResponse.status).toBe(204);

    const clearCookie = logoutResponse.headers["set-cookie"];
    const [cookieValue] = Array.isArray(clearCookie) ? clearCookie : [];

    expect(cookieValue).toContain("Expires=Thu, 01 Jan 1970");
  });

  it("invalidates the session so the old cookie no longer works", async () => {
    const sessionCookie = await login();

    const logoutResponse = await supertest(app.getHttpServer())
      .post("/auth/logout")
      .set("Cookie", sessionCookie);

    expect(logoutResponse.status).toBe(204);

    const meResponse = await supertest(app.getHttpServer())
      .get("/auth/me")
      .set("Cookie", sessionCookie);

    expect(meResponse.status).toBe(401);
    expect(meResponse.body.code).toBe("UNAUTHENTICATED");
  });
});

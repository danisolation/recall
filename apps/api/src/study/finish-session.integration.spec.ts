import "reflect-metadata";
import { type INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { eq, users } from "@danisolation-recall/database";
import supertest from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "../app.module";
import { hashPassword } from "../auth/password";
import { UsersRepository } from "../auth/users.repository";
import { DATABASE_PROVIDER, type Database } from "../database/database.module";
import { SetsRepository } from "../sets/sets.repository";
import { SessionsRepository } from "./sessions.repository";

describe("POST /study-sessions/:id/finish and /abandon (integration)", () => {
  let app: INestApplication;
  let db: Database;

  const email = "finish-session.integration@example.com";
  const otherEmail = "finish-session.integration.other@example.com";
  const password = "correct horse battery staple";
  let sessionCookie: string;
  let ownerId: number;
  let otherId: number;
  let sets: SetsRepository;
  let sessions: SessionsRepository;
  let setId: number;

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
    ownerId = owner.id;

    const other = await usersRepository.create({ email: otherEmail });
    otherId = other.id;

    sets = app.get(SetsRepository);
    sessions = app.get(SessionsRepository);

    const set = await sets.create(ownerId, { title: "Finish session set" });
    setId = set.id;

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

  it("finishes an active session and sets finished_at", async () => {
    const created = await sessions.create(ownerId, setId);

    const response = await supertest(app.getHttpServer())
      .post(`/study-sessions/${created!.id}/finish`)
      .set("Cookie", sessionCookie);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(created!.id);
    expect(response.body.status).toBe("COMPLETED");
    expect(response.body.finishedAt).toBeTruthy();
    expect(new Date(response.body.finishedAt).getTime()).toBeLessThanOrEqual(
      Date.now(),
    );
  });

  it("treats a repeat finish as an idempotent no-op success", async () => {
    const created = await sessions.create(ownerId, setId);

    const first = await supertest(app.getHttpServer())
      .post(`/study-sessions/${created!.id}/finish`)
      .set("Cookie", sessionCookie);

    expect(first.status).toBe(200);

    const repeat = await supertest(app.getHttpServer())
      .post(`/study-sessions/${created!.id}/finish`)
      .set("Cookie", sessionCookie);

    expect(repeat.status).toBe(200);
    expect(repeat.body.status).toBe("COMPLETED");
    expect(repeat.body.finishedAt).toBe(first.body.finishedAt);
  });

  it("abandons an active session and sets finished_at", async () => {
    const created = await sessions.create(ownerId, setId);

    const response = await supertest(app.getHttpServer())
      .post(`/study-sessions/${created!.id}/abandon`)
      .set("Cookie", sessionCookie);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ABANDONED");
    expect(response.body.finishedAt).toBeTruthy();
  });

  it("rejects finishing an abandoned session with 409 INVALID_STUDY_SESSION", async () => {
    const created = await sessions.create(ownerId, setId);
    await sessions.abandon(created!.id, ownerId);

    const response = await supertest(app.getHttpServer())
      .post(`/study-sessions/${created!.id}/finish`)
      .set("Cookie", sessionCookie);

    expect(response.status).toBe(409);
    expect(response.body.code).toBe("INVALID_STUDY_SESSION");
  });

  it("rejects abandoning a completed session with 409 INVALID_STUDY_SESSION", async () => {
    const created = await sessions.create(ownerId, setId);
    await sessions.complete(created!.id, ownerId);

    const response = await supertest(app.getHttpServer())
      .post(`/study-sessions/${created!.id}/abandon`)
      .set("Cookie", sessionCookie);

    expect(response.status).toBe(409);
    expect(response.body.code).toBe("INVALID_STUDY_SESSION");
  });

  it("returns 404 SESSION_NOT_FOUND for a foreign, unknown, or malformed session", async () => {
    const foreignSet = await sets.create(otherId, { title: "Foreign set" });
    const foreignSession = await sessions.create(otherId, foreignSet.id);

    const foreignResponse = await supertest(app.getHttpServer())
      .post(`/study-sessions/${foreignSession!.id}/finish`)
      .set("Cookie", sessionCookie);

    expect(foreignResponse.status).toBe(404);
    expect(foreignResponse.body.code).toBe("SESSION_NOT_FOUND");

    const missingResponse = await supertest(app.getHttpServer())
      .post("/study-sessions/99999999/finish")
      .set("Cookie", sessionCookie);

    expect(missingResponse.status).toBe(404);
    expect(missingResponse.body.code).toBe("SESSION_NOT_FOUND");

    const malformedResponse = await supertest(app.getHttpServer())
      .post("/study-sessions/not-a-number/finish")
      .set("Cookie", sessionCookie);

    expect(malformedResponse.status).toBe(404);
    expect(malformedResponse.body.code).toBe("SESSION_NOT_FOUND");
  });

  it("rejects a request without a session cookie with 401", async () => {
    const response = await supertest(app.getHttpServer()).post(
      "/study-sessions/1/finish",
    );

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("UNAUTHENTICATED");
  });
});

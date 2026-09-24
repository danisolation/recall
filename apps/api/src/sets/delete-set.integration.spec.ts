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

describe("DELETE /sets/:id (integration)", () => {
  let app: INestApplication;
  let db: Database;

  const email = "delete-set.integration@example.com";
  const otherEmail = "delete-set.other@example.com";
  const password = "correct horse battery staple";
  let sessionCookie: string;
  let ownerId: number;
  let otherId: number;
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
    ownerId = owner.id;
    otherId = other.id;

    const setsRepository = app.get(SetsRepository);
    const foreignSet = await setsRepository.create(otherId, {
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

  it("deletes the owner's set with 204", async () => {
    const setsRepository = app.get(SetsRepository);
    const ownedSet = await setsRepository.create(ownerId, {
      title: "Doomed set",
    });

    const response = await supertest(app.getHttpServer())
      .delete(`/sets/${ownedSet.id}`)
      .set("Cookie", sessionCookie);

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});

    const after = await supertest(app.getHttpServer())
      .get(`/sets/${ownedSet.id}`)
      .set("Cookie", sessionCookie);

    expect(after.status).toBe(404);
    expect(after.body.code).toBe("SET_NOT_FOUND");
  });

  it("returns 404 for a missing set", async () => {
    const response = await supertest(app.getHttpServer())
      .delete("/sets/99999999")
      .set("Cookie", sessionCookie);

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("SET_NOT_FOUND");
  });

  it("returns 404 for another user's set and leaves it intact", async () => {
    const response = await supertest(app.getHttpServer())
      .delete(`/sets/${foreignSetId}`)
      .set("Cookie", sessionCookie);

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("SET_NOT_FOUND");

    const setsRepository = app.get(SetsRepository);
    const foreignSet = await setsRepository.findById(foreignSetId, otherId);
    expect(foreignSet?.title).toBe("Foreign set");
  });

  it("returns 404 on a repeat delete", async () => {
    const setsRepository = app.get(SetsRepository);
    const once = await setsRepository.create(ownerId, {
      title: "Deleted once",
    });

    const first = await supertest(app.getHttpServer())
      .delete(`/sets/${once.id}`)
      .set("Cookie", sessionCookie);

    expect(first.status).toBe(204);

    const second = await supertest(app.getHttpServer())
      .delete(`/sets/${once.id}`)
      .set("Cookie", sessionCookie);

    expect(second.status).toBe(404);
    expect(second.body.code).toBe("SET_NOT_FOUND");
  });
});

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

describe("PUT /sets/:id/tags (integration)", () => {
  let app: INestApplication;
  let db: Database;

  const ownerEmail = "put-set-tags.integration@example.com";
  const otherEmail = "put-set-tags.other@example.com";
  const password = "correct horse battery staple";
  let ownerCookie: string;
  let otherCookie: string;
  let sets: SetsRepository;
  let setId: number;
  let foreignSetId: number;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    db = app.get<Database>(DATABASE_PROVIDER);
    await db.delete(users).where(eq(users.email, ownerEmail));
    await db.delete(users).where(eq(users.email, otherEmail));

    const usersRepository = app.get(UsersRepository);
    const owner = await usersRepository.create({
      email: ownerEmail,
      passwordHash: await hashPassword(password),
    });
    const other = await usersRepository.create({
      email: otherEmail,
      passwordHash: await hashPassword(password),
    });

    sets = app.get(SetsRepository);

    const set = await sets.create(owner.id, { title: "Tagged set" });
    setId = set.id;

    const foreignSet = await sets.create(other.id, { title: "Foreign set" });
    foreignSetId = foreignSet.id;

    const login = async (email: string) => {
      const response = await supertest(app.getHttpServer())
        .post("/auth/login")
        .send({ email, password });

      expect(response.status).toBe(200);

      const setCookie = response.headers["set-cookie"];
      const [cookie] = Array.isArray(setCookie) ? setCookie : [];

      if (!cookie) {
        throw new Error("login did not set a session cookie");
      }

      return cookie;
    };

    ownerCookie = await login(ownerEmail);
    otherCookie = await login(otherEmail);
  });

  afterAll(async () => {
    await db.delete(users).where(eq(users.email, ownerEmail));
    await db.delete(users).where(eq(users.email, otherEmail));
    await app.close();
    await db.$client.end();
  });

  it("replaces the set's tags, trimming and creating unknown names", async () => {
    const response = await supertest(app.getHttpServer())
      .put(`/sets/${setId}/tags`)
      .set("Cookie", ownerCookie)
      .send({ tags: ["  Biology  ", "exam prep"] });

    expect(response.status).toBe(200);
    expect(
      response.body.map((tag: { name: string }) => tag.name),
    ).toEqual(["Biology", "exam prep"]);
    expect(
      response.body.every(
        (tag: { createdAt: string; updatedAt: string; userId: number }) =>
          tag.createdAt && tag.updatedAt && tag.userId,
      ),
    ).toBe(true);
  });

  it("reuses the same tag row for a case-insensitive match", async () => {
    const first = await supertest(app.getHttpServer())
      .put(`/sets/${setId}/tags`)
      .set("Cookie", ownerCookie)
      .send({ tags: ["Biology"] });

    expect(first.status).toBe(200);
    const biologyId = first.body[0].id;

    const second = await supertest(app.getHttpServer())
      .put(`/sets/${setId}/tags`)
      .set("Cookie", ownerCookie)
      .send({ tags: ["biology"] });

    expect(second.status).toBe(200);
    expect(second.body).toHaveLength(1);
    expect(second.body[0].id).toBe(biologyId);
    expect(second.body[0].name).toBe("Biology");
  });

  it("removes dropped tags from the set", async () => {
    await supertest(app.getHttpServer())
      .put(`/sets/${setId}/tags`)
      .set("Cookie", ownerCookie)
      .send({ tags: ["Biology", "exam prep"] });

    const response = await supertest(app.getHttpServer())
      .put(`/sets/${setId}/tags`)
      .set("Cookie", ownerCookie)
      .send({ tags: ["exam prep"] });

    expect(response.status).toBe(200);
    expect(
      response.body.map((tag: { name: string }) => tag.name),
    ).toEqual(["exam prep"]);
  });

  it("clears the set's tags with an empty list", async () => {
    const response = await supertest(app.getHttpServer())
      .put(`/sets/${setId}/tags`)
      .set("Cookie", ownerCookie)
      .send({ tags: [] });

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("rejects a foreign set with 404, leaving it intact", async () => {
    const response = await supertest(app.getHttpServer())
      .put(`/sets/${foreignSetId}/tags`)
      .set("Cookie", ownerCookie)
      .send({ tags: ["intruder"] });

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("SET_NOT_FOUND");

    const foreignTags = await supertest(app.getHttpServer())
      .put(`/sets/${foreignSetId}/tags`)
      .set("Cookie", otherCookie)
      .send({ tags: ["their own"] });

    expect(
      foreignTags.body.map((tag: { name: string }) => tag.name),
    ).toEqual(["their own"]);
  });

  it("folds a malformed or unknown set id into 404", async () => {
    const malformed = await supertest(app.getHttpServer())
      .put("/sets/not-a-number/tags")
      .set("Cookie", ownerCookie)
      .send({ tags: ["x"] });

    expect(malformed.status).toBe(404);
    expect(malformed.body.code).toBe("SET_NOT_FOUND");

    const unknown = await supertest(app.getHttpServer())
      .put("/sets/99999999/tags")
      .set("Cookie", ownerCookie)
      .send({ tags: ["x"] });

    expect(unknown.status).toBe(404);
    expect(unknown.body.code).toBe("SET_NOT_FOUND");
  });

  it("rejects more than 10 tags with 400", async () => {
    const tags = Array.from({ length: 11 }, (_, index) => `tag ${index}`);

    const response = await supertest(app.getHttpServer())
      .put(`/sets/${setId}/tags`)
      .set("Cookie", ownerCookie)
      .send({ tags });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("VALIDATION_ERROR");
  });

  it("rejects an over-length name with 400", async () => {
    const response = await supertest(app.getHttpServer())
      .put(`/sets/${setId}/tags`)
      .set("Cookie", ownerCookie)
      .send({ tags: ["a".repeat(51)] });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("VALIDATION_ERROR");
  });

  it("rejects a request without a session cookie with 401", async () => {
    const response = await supertest(app.getHttpServer())
      .put(`/sets/${setId}/tags`)
      .send({ tags: ["Biology"] });

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("UNAUTHENTICATED");
  });
});

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
import { TagsRepository } from "./tags.repository";

describe("GET /tags (integration)", () => {
  let app: INestApplication;
  let db: Database;

  const ownerEmail = "get-tags.integration@example.com";
  const otherEmail = "get-tags.other@example.com";
  const password = "correct horse battery staple";
  let ownerCookie: string;
  let otherCookie: string;
  let ownerId: number;
  let sets: SetsRepository;
  let tags: TagsRepository;
  let setId: number;

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
    ownerId = owner.id;
    const other = await usersRepository.create({
      email: otherEmail,
      passwordHash: await hashPassword(password),
    });

    sets = app.get(SetsRepository);
    tags = app.get(TagsRepository);

    const set = await sets.create(ownerId, { title: "Tag list set" });
    setId = set.id;

    await tags.replace(setId, ownerId, ["biology", "exam prep"]);

    const otherSet = await sets.create(other.id, { title: "Foreign set" });
    await tags.replace(otherSet.id, other.id, ["outsider"]);

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

  it("returns the caller's tags alphabetically", async () => {
    const response = await supertest(app.getHttpServer())
      .get("/tags")
      .set("Cookie", ownerCookie);

    expect(response.status).toBe(200);
    expect(
      response.body.map((tag: { name: string }) => tag.name),
    ).toEqual(["biology", "exam prep"]);
    expect(
      response.body.every((tag: { userId: number }) => tag.userId === ownerId),
    ).toBe(true);
  });

  it("never returns another user's tags", async () => {
    const response = await supertest(app.getHttpServer())
      .get("/tags")
      .set("Cookie", otherCookie);

    expect(response.status).toBe(200);
    expect(
      response.body.map((tag: { name: string }) => tag.name),
    ).toEqual(["outsider"]);
  });

  it("rejects a request without a session cookie with 401", async () => {
    const response = await supertest(app.getHttpServer()).get("/tags");

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("UNAUTHENTICATED");
  });
});

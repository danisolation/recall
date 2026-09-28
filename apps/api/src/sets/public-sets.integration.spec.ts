import "reflect-metadata";
import { type INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { eq, users } from "@danisolation-recall/database";
import supertest from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "../app.module";
import { hashPassword } from "../auth/password";
import { UsersRepository } from "../auth/users.repository";
import { CardsRepository } from "../cards/cards.repository";
import { DATABASE_PROVIDER, type Database } from "../database/database.module";
import { SetsRepository } from "../sets/sets.repository";
import { TagsRepository } from "../tags/tags.repository";

describe("GET /public/sets/:id (integration)", () => {
  let app: INestApplication;
  let db: Database;

  const ownerEmail = "public-sets.integration@example.com";
  const password = "correct horse battery staple";
  let ownerCookie: string;
  let sets: SetsRepository;
  let cards: CardsRepository;
  let tags: TagsRepository;
  let publicSetId!: number;
  let privateSetId!: number;

  async function loginAsOwner(): Promise<string> {
    const login = await supertest(app.getHttpServer())
      .post("/auth/login")
      .send({ email: ownerEmail, password });

    expect(login.status).toBe(200);

    const setCookie = login.headers["set-cookie"];
    const [cookie] = Array.isArray(setCookie) ? setCookie : [];

    if (!cookie) {
      throw new Error("login did not set a session cookie");
    }

    return cookie;
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    db = app.get<Database>(DATABASE_PROVIDER);
    await db.delete(users).where(eq(users.email, ownerEmail));

    const usersRepository = app.get(UsersRepository);
    const owner = await usersRepository.create({
      email: ownerEmail,
      passwordHash: await hashPassword(password),
    });

    sets = app.get(SetsRepository);
    cards = app.get(CardsRepository);
    tags = app.get(TagsRepository);

    // A public set with two cards in study order and two tags.
    const publicSet = await sets.create(owner.id, {
      title: "Shared biology",
      description: "Cells and heredity",
    });
    publicSetId = publicSet.id;
    await cards.create(publicSetId, owner.id, { front: "Second card", back: "2" });
    await cards.create(publicSetId, owner.id, { front: "First card", back: "1" });
    await sets.update(publicSetId, owner.id, { visibility: "public" });
    await tags.replace(publicSetId, owner.id, ["biology", "exam prep"]);

    // A set that was never shared.
    const privateSet = await sets.create(owner.id, {
      title: "Private notes",
    });
    privateSetId = privateSet.id;

    ownerCookie = await loginAsOwner();
  });

  afterAll(async () => {
    await db.delete(users).where(eq(users.email, ownerEmail));
    await app.close();
    await db.$client.end();
  });

  it("serves a public set's content to an unauthenticated visitor", async () => {
    const response = await supertest(app.getHttpServer()).get(
      `/public/sets/${publicSetId}`,
    );

    expect(response.status).toBe(200);
    expect(response.body.title).toBe("Shared biology");
    expect(response.body.description).toBe("Cells and heredity");
    // Cards arrive in study order; the payload whitelists what a visitor
    // needs (no ownerId or visibility token).
    expect(
      response.body.cards.map((card: { front: string }) => card.front),
    ).toEqual(["Second card", "First card"]);
    expect(
      response.body.cards.every(
        (card: { front: unknown; back: unknown }) =>
          typeof card.front === "string" && typeof card.back === "string",
      ),
    ).toBe(true);
    expect(
      response.body.tags.map((tag: { name: string }) => tag.name),
    ).toEqual(["biology", "exam prep"]);
    expect(response.body.ownerId).toBeUndefined();
    expect(response.body.visibility).toBeUndefined();
  });

  it("folds a private set into 404 — even for its owner", async () => {
    const response = await supertest(app.getHttpServer()).get(
      `/public/sets/${privateSetId}`,
    );

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("SET_NOT_FOUND");
  });

  it("folds an unknown or malformed id into 404", async () => {
    const missing = await supertest(app.getHttpServer()).get(
      "/public/sets/99999999",
    );
    expect(missing.status).toBe(404);
    expect(missing.body.code).toBe("SET_NOT_FOUND");

    const malformed = await supertest(app.getHttpServer()).get(
      "/public/sets/not-a-number",
    );
    expect(malformed.status).toBe(404);
    expect(malformed.body.code).toBe("SET_NOT_FOUND");
  });

  it("unsharing folds the set back into 404", async () => {
    const share = await supertest(app.getHttpServer())
      .patch(`/sets/${publicSetId}`)
      .set("Cookie", ownerCookie)
      .send({ visibility: "private" });
    expect(share.status).toBe(200);

    const after = await supertest(app.getHttpServer()).get(
      `/public/sets/${publicSetId}`,
    );
    expect(after.status).toBe(404);
    expect(after.body.code).toBe("SET_NOT_FOUND");
  });
});

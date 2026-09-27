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

describe("/folders (integration)", () => {
  let app: INestApplication;
  let db: Database;

  const ownerEmail = "folders.integration@example.com";
  const otherEmail = "folders.other@example.com";
  const password = "correct horse battery staple";
  let ownerCookie: string;
  let otherCookie: string;
  let universityId!: number;
  let otherFolderId!: number;
  let algebraSetId!: number;
  let chemistrySetId!: number;

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
    await usersRepository.create({
      email: otherEmail,
      passwordHash: await hashPassword(password),
    });

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

    const algebra = await supertest(app.getHttpServer())
      .post("/sets")
      .set("Cookie", ownerCookie)
      .send({ title: "Algebra" });
    expect(algebra.status).toBe(201);
    algebraSetId = algebra.body.id;
  });

  afterAll(async () => {
    await db.delete(users).where(eq(users.email, ownerEmail));
    await db.delete(users).where(eq(users.email, otherEmail));
    await app.close();
    await db.$client.end();
  });

  it("creates a folder", async () => {
    const response = await supertest(app.getHttpServer())
      .post("/folders")
      .set("Cookie", ownerCookie)
      .send({ name: "University" });

    expect(response.status).toBe(201);
    expect(response.body.name).toBe("University");
    universityId = response.body.id;
  });

  it("rejects a case-insensitive duplicate with 409", async () => {
    const response = await supertest(app.getHttpServer())
      .post("/folders")
      .set("Cookie", ownerCookie)
      .send({ name: "university" });

    expect(response.status).toBe(409);
    expect(response.body.code).toBe("FOLDER_NAME_TAKEN");
  });

  it("lets another user own the same name", async () => {
    const response = await supertest(app.getHttpServer())
      .post("/folders")
      .set("Cookie", otherCookie)
      .send({ name: "University" });

    expect(response.status).toBe(201);
    otherFolderId = response.body.id;
  });

  it("lists the caller's folders with counts", async () => {
    const response = await supertest(app.getHttpServer())
      .get("/folders")
      .set("Cookie", ownerCookie);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toMatchObject({
      name: "University",
      setCount: 0,
    });
  });

  it("files a set through the set's update endpoint", async () => {
    const response = await supertest(app.getHttpServer())
      .patch(`/sets/${algebraSetId}`)
      .set("Cookie", ownerCookie)
      .send({ folderId: universityId });

    expect(response.status).toBe(200);
    expect(response.body.folderId).toBe(universityId);
  });

  it("rejects a foreign folder on the set's update with 404", async () => {
    const response = await supertest(app.getHttpServer())
      .patch(`/sets/${algebraSetId}`)
      .set("Cookie", ownerCookie)
      .send({ folderId: otherFolderId });

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("FOLDER_NOT_FOUND");
  });

  it("counts filed sets in the folder list", async () => {
    const response = await supertest(app.getHttpServer())
      .get("/folders")
      .set("Cookie", ownerCookie);

    expect(response.body[0]).toMatchObject({
      name: "University",
      setCount: 1,
    });
  });

  it("files a new set at creation through folderId", async () => {
    const response = await supertest(app.getHttpServer())
      .post("/sets")
      .set("Cookie", ownerCookie)
      .send({ title: "Chemistry", folderId: universityId });

    expect(response.status).toBe(201);
    expect(response.body.folderId).toBe(universityId);
    chemistrySetId = response.body.id;
  });

  it("rejects an unknown folderId at creation with 404", async () => {
    const response = await supertest(app.getHttpServer())
      .post("/sets")
      .set("Cookie", ownerCookie)
      .send({ title: "Physics", folderId: 99999999 });

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("FOLDER_NOT_FOUND");
  });

  it("renames a folder", async () => {
    const response = await supertest(app.getHttpServer())
      .patch(`/folders/${universityId}`)
      .set("Cookie", ownerCookie)
      .send({ name: "Classes" });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Classes");
  });

  it("folds a foreign folder's rename into 404", async () => {
    const response = await supertest(app.getHttpServer())
      .patch(`/folders/${otherFolderId}`)
      .set("Cookie", ownerCookie)
      .send({ name: "Stolen" });

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("FOLDER_NOT_FOUND");
  });

  it("unfiles a set through folderId null", async () => {
    const response = await supertest(app.getHttpServer())
      .patch(`/sets/${algebraSetId}`)
      .set("Cookie", ownerCookie)
      .send({ folderId: null });

    expect(response.status).toBe(200);
    expect(response.body.folderId).toBeNull();
  });

  it("deletes a folder and unfiles its sets without deleting them", async () => {
    const response = await supertest(app.getHttpServer())
      .delete(`/folders/${universityId}`)
      .set("Cookie", ownerCookie);

    expect(response.status).toBe(204);

    const setResponse = await supertest(app.getHttpServer())
      .get(`/sets/${chemistrySetId}`)
      .set("Cookie", ownerCookie);

    expect(setResponse.status).toBe(200);
    expect(setResponse.body.title).toBe("Chemistry");
    expect(setResponse.body.folderId).toBeNull();
  });

  it("folds a repeated delete into 404", async () => {
    const response = await supertest(app.getHttpServer())
      .delete(`/folders/${universityId}`)
      .set("Cookie", ownerCookie);

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("FOLDER_NOT_FOUND");
  });

  it("rejects an unauthenticated request with 401", async () => {
    const response = await supertest(app.getHttpServer()).get("/folders");

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("UNAUTHENTICATED");
  });
});

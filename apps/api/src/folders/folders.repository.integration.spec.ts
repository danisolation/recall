import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  createDb,
  eq,
  studySets,
  users,
} from "@danisolation-recall/database";
import { SetsRepository } from "../sets/sets.repository";
import { FoldersRepository } from "./folders.repository";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to run integration tests");
}

describe("FoldersRepository", () => {
  const db = createDb(connectionString);
  const folders = new FoldersRepository(db);
  const sets = new SetsRepository(db);

  const ownerEmail = "folders.repository.owner@example.com";
  const otherEmail = "folders.repository.other@example.com";

  let ownerId!: number;
  let otherId!: number;
  let universityId!: number;
  let examsId!: number;
  let algebraSetId!: number;

  beforeAll(async () => {
    await db.delete(users).where(eq(users.email, ownerEmail));
    await db.delete(users).where(eq(users.email, otherEmail));

    const [owner] = await db
      .insert(users)
      .values({ email: ownerEmail })
      .returning();
    const [other] = await db
      .insert(users)
      .values({ email: otherEmail })
      .returning();

    if (!owner || !other) {
      throw new Error("Failed to create test users");
    }

    ownerId = owner.id;
    otherId = other.id;
  });

  afterAll(async () => {
    await db.delete(users).where(eq(users.email, ownerEmail));
    await db.delete(users).where(eq(users.email, otherEmail));
    await db.$client.end();
  });

  it("creates a folder and returns it", async () => {
    const folder = await folders.create(ownerId, "University");

    expect(folder).not.toBe("conflict");
    if (folder === "conflict") {
      throw new Error("unexpected conflict");
    }
    universityId = folder.id;
    expect(folder.name).toBe("University");
    expect(folder.userId).toBe(ownerId);
  });

  it("translates a case-insensitive duplicate into a conflict", async () => {
    const result = await folders.create(ownerId, "university");

    expect(result).toBe("conflict");
  });

  it("lists the caller's folders alphabetically with set counts", async () => {
    const exams = await folders.create(ownerId, "Exams");
    if (exams === "conflict") {
      throw new Error("unexpected conflict");
    }
    examsId = exams.id;

    const algebra = await sets.create(ownerId, { title: "Algebra" });
    const history = await sets.create(ownerId, { title: "History" });
    algebraSetId = algebra.id;

    // FOLD-004 wires placement through the set contracts; until then the
    // fixture files the set directly.
    await db
      .update(studySets)
      .set({ folderId: universityId })
      .where(eq(studySets.id, algebra.id));

    const ownerFolders = await folders.listByUser(ownerId);

    expect(ownerFolders.map((folder) => folder.name)).toEqual([
      "Exams",
      "University",
    ]);
    expect(ownerFolders.map((folder) => folder.setCount)).toEqual([0, 1]);
    // A fresh set is unfiled — the library root (ADR-014).
    expect(history.folderId).toBeNull();

    // Another user's folder list is empty — scoping is in the WHERE (§41).
    expect(await folders.listByUser(otherId)).toEqual([]);
  });

  it("renames a folder and keeps the display casing", async () => {
    const result = await folders.rename(universityId, ownerId, "Classes");

    expect(result.outcome).toBe("renamed");
    if (result.outcome === "renamed") {
      expect(result.folder.name).toBe("Classes");
      expect(result.folder.updatedAt.getTime()).toBeGreaterThan(
        result.folder.createdAt.getTime(),
      );
    }
  });

  it("folds a foreign folder's rename into notFound", async () => {
    const result = await folders.rename(universityId, otherId, "Stolen");

    expect(result.outcome).toBe("notFound");
  });

  it("translates a duplicate rename into a conflict", async () => {
    const result = await folders.rename(universityId, ownerId, "exams");

    expect(result.outcome).toBe("conflict");
  });

  it("removes a folder and unfiles its sets without deleting them", async () => {
    const temp = await folders.create(ownerId, "Temp");
    if (temp === "conflict") {
      throw new Error("unexpected conflict");
    }
    const tempSet = await sets.create(ownerId, { title: "Temp set" });
    await db
      .update(studySets)
      .set({ folderId: temp.id })
      .where(eq(studySets.id, tempSet.id));

    const removed = await folders.remove(temp.id, ownerId);

    expect(removed).toBe(true);
    const [setRow] = await db
      .select()
      .from(studySets)
      .where(eq(studySets.id, tempSet.id));
    expect(setRow?.title).toBe("Temp set");
    expect(setRow?.folderId).toBeNull();
  });

  it("folds a foreign removal into false and leaves the folder intact", async () => {
    const removed = await folders.remove(examsId, otherId);

    expect(removed).toBe(false);
    const ownerFolders = await folders.listByUser(ownerId);
    expect(ownerFolders.map((folder) => folder.name)).toContain("Exams");
  });

  it("answers the placement check per owner", async () => {
    expect(await folders.isOwnedBy(examsId, ownerId)).toBe(true);
    expect(await folders.isOwnedBy(examsId, otherId)).toBe(false);
    expect(await folders.isOwnedBy(99999999, ownerId)).toBe(false);
  });
});

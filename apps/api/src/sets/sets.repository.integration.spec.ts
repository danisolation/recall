import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createDb, eq, users } from "@danisolation-recall/database";
import { SetsRepository } from "./sets.repository";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to run integration tests");
}

describe("SetsRepository", () => {
  const db = createDb(connectionString);
  const repository = new SetsRepository(db);
  const ownerEmail = "sets.repository.owner@example.com";
  const otherEmail = "sets.repository.other@example.com";

  let ownerId!: number;
  let otherId!: number;

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

  it("creates a set for its owner", async () => {
    const set = await repository.create(ownerId, {
      title: "Biology basics",
      description: "Cells, DNA, and heredity",
    });

    expect(set.id).toBeGreaterThan(0);
    expect(set.ownerId).toBe(ownerId);
    expect(set.title).toBe("Biology basics");
    expect(set.description).toBe("Cells, DNA, and heredity");
    expect(set.createdAt).toBeInstanceOf(Date);
    expect(set.updatedAt).toBeInstanceOf(Date);
  });

  it("creates a set without a description", async () => {
    const set = await repository.create(ownerId, { title: "No description" });

    expect(set.description).toBeNull();
  });

  it("finds a set by id for its owner", async () => {
    const created = await repository.create(ownerId, { title: "Findable" });
    const found = await repository.findById(created.id, ownerId);

    expect(found?.id).toBe(created.id);
    expect(found?.title).toBe("Findable");
  });

  it("does not find another user's set", async () => {
    const created = await repository.create(ownerId, { title: "Private" });
    const found = await repository.findById(created.id, otherId);

    expect(found).toBeNull();
  });

  it("returns null for an unknown id", async () => {
    const found = await repository.findById(99_999_999, ownerId);

    expect(found).toBeNull();
  });

  it("lists the owner's sets newest first", async () => {
    await repository.create(ownerId, { title: "List A" });
    await repository.create(ownerId, { title: "List B" });
    await repository.create(ownerId, { title: "List C" });

    const sets = await repository.listByOwner(ownerId, {
      limit: 10,
      offset: 0,
    });

    const titles = sets.map((set) => set.title);
    expect(titles.indexOf("List C")).toBeLessThan(titles.indexOf("List B"));
    expect(titles.indexOf("List B")).toBeLessThan(titles.indexOf("List A"));
  });

  it("excludes other users' sets from the list", async () => {
    await repository.create(otherId, { title: "Someone else's set" });

    const sets = await repository.listByOwner(ownerId, {
      limit: 10,
      offset: 0,
    });

    expect(sets.map((set) => set.title)).not.toContain(
      "Someone else's set",
    );
  });

  it("paginates with limit and offset", async () => {
    const pageOne = await repository.listByOwner(ownerId, {
      limit: 2,
      offset: 0,
    });

    expect(pageOne).toHaveLength(2);

    const pageTwo = await repository.listByOwner(ownerId, {
      limit: 10,
      offset: 2,
    });

    expect(pageTwo.length).toBeGreaterThanOrEqual(1);
    expect(pageOne.map((set) => set.id)).not.toContain(pageTwo[0]!.id);
  });

  it("updates only the provided fields", async () => {
    const created = await repository.create(ownerId, {
      title: "Before title",
      description: "Before description",
    });

    const updated = await repository.update(created.id, ownerId, {
      title: "After title",
    });

    expect(updated?.title).toBe("After title");
    expect(updated?.description).toBe("Before description");
    expect(updated!.updatedAt.getTime()).toBeGreaterThanOrEqual(
      created.updatedAt.getTime(),
    );
  });

  it("does not update another user's set", async () => {
    const created = await repository.create(ownerId, { title: "Untouched" });

    const updated = await repository.update(created.id, otherId, {
      title: "Hijacked",
    });

    expect(updated).toBeNull();

    const found = await repository.findById(created.id, ownerId);
    expect(found?.title).toBe("Untouched");
  });

  it("deletes a set", async () => {
    const created = await repository.create(ownerId, { title: "Doomed" });

    const deleted = await repository.delete(created.id, ownerId);

    expect(deleted).toBe(true);
    expect(await repository.findById(created.id, ownerId)).toBeNull();
  });

  it("reports deleting another user's set as not found", async () => {
    const created = await repository.create(ownerId, { title: "Survivor" });

    const deleted = await repository.delete(created.id, otherId);

    expect(deleted).toBe(false);

    const found = await repository.findById(created.id, ownerId);
    expect(found?.title).toBe("Survivor");
  });

  it("reports a repeat delete as not found", async () => {
    const created = await repository.create(ownerId, {
      title: "Deleted twice",
    });

    expect(await repository.delete(created.id, ownerId)).toBe(true);
    expect(await repository.delete(created.id, ownerId)).toBe(false);
  });
});

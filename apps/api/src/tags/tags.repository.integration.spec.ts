import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  createDb,
  eq,
  users,
} from "@danisolation-recall/database";
import { SetsRepository } from "../sets/sets.repository";
import { TagsRepository } from "./tags.repository";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to run integration tests");
}

describe("TagsRepository", () => {
  const db = createDb(connectionString);
  const tags = new TagsRepository(db);
  const sets = new SetsRepository(db);

  const ownerEmail = "tags.repository.owner@example.com";
  const otherEmail = "tags.repository.other@example.com";

  let ownerId!: number;
  let otherId!: number;
  let setId!: number;
  let otherSetId!: number;

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

    const set = await sets.create(ownerId, { title: "Tag test set" });
    setId = set.id;

    const otherSet = await sets.create(otherId, { title: "Foreign set" });
    otherSetId = otherSet.id;
  });

  afterAll(async () => {
    await db.delete(users).where(eq(users.email, ownerEmail));
    await db.delete(users).where(eq(users.email, otherEmail));
    await db.$client.end();
  });

  it("replaces a set's tags, creating unknown names", async () => {
    const result = await tags.replace(setId, ownerId, [
      "Biology",
      "  exam prep  ",
    ]);

    expect(result.outcome).toBe("replaced");
    if (result.outcome === "replaced") {
      expect(result.tags.map((tag) => tag.name)).toEqual([
        "Biology",
        "exam prep",
      ]);
    }
    expect((await tags.listBySet(setId, ownerId))!.map((t) => t.name)).toEqual([
      "Biology",
      "exam prep",
    ]);
  });

  it("dedupes case-insensitively with the first casing winning", async () => {
    const result = await tags.replace(setId, ownerId, [
      "Biology",
      "biology",
      "  BIOLOGY  ",
    ]);

    expect(result.outcome).toBe("replaced");
    if (result.outcome === "replaced") {
      expect(result.tags).toHaveLength(1);
      expect(result.tags[0]!.name).toBe("Biology");
    }
    expect(await tags.listBySet(setId, ownerId)).toHaveLength(1);
  });

  it("keeps the same tag row when a name survives a replace", async () => {
    const first = await tags.replace(setId, ownerId, ["alpha", "beta"]);
    const betaId = first.outcome === "replaced"
      ? first.tags.find((tag) => tag.name === "beta")!.id
      : 0;

    const second = await tags.replace(setId, ownerId, ["beta", "gamma"]);

    expect(second.outcome).toBe("replaced");
    if (second.outcome === "replaced") {
      expect(second.tags.map((tag) => tag.name)).toEqual(["beta", "gamma"]);
      // The surviving name is the same tag row — create-or-get, not
      // recreate.
      expect(second.tags.find((tag) => tag.name === "beta")!.id).toBe(betaId);
    }
    expect((await tags.listBySet(setId, ownerId))!.map((t) => t.name)).toEqual([
      "beta",
      "gamma",
    ]);
  });

  it("removes dropped tags from the set but keeps them for the user", async () => {
    await tags.replace(setId, ownerId, ["alpha", "gamma"]);
    const result = await tags.replace(setId, ownerId, ["gamma"]);

    expect(result.outcome).toBe("replaced");
    expect(
      (await tags.listBySet(setId, ownerId))!.map((t) => t.name),
    ).toEqual(["gamma"]);
    // Tags are user-owned vocabulary — untagging a set does not delete them.
    const userTags = (await tags.listByUser(ownerId)).map((t) => t.name);
    expect(userTags).toContain("alpha");
    expect(userTags).toContain("gamma");
  });

  it("clears a set's tags when replaced with an empty list", async () => {
    const result = await tags.replace(setId, ownerId, []);

    expect(result.outcome).toBe("replaced");
    if (result.outcome === "replaced") {
      expect(result.tags).toEqual([]);
    }
    expect(await tags.listBySet(setId, ownerId)).toEqual([]);
    expect((await tags.listByUser(ownerId)).length).toBeGreaterThan(0);
  });

  it("returns notFound for a foreign or unknown set", async () => {
    expect((await tags.replace(otherSetId, ownerId, ["x"])).outcome).toBe(
      "notFound",
    );
    expect((await tags.replace(99999999, ownerId, ["x"])).outcome).toBe(
      "notFound",
    );
    // Nothing leaked into the foreign set — its owner still sees no tags.
    expect(await tags.listBySet(otherSetId, otherId)).toEqual([]);
    expect(await tags.listBySet(otherSetId, ownerId)).toBeNull();
    expect(await tags.listBySet(99999999, ownerId)).toBeNull();
  });

  it("scopes tags per user — the same name is a different tag row", async () => {
    await tags.replace(otherSetId, otherId, ["shared"]);

    const result = await tags.replace(setId, ownerId, ["shared"]);

    expect(result.outcome === "replaced" && result.tags).toHaveLength(1);
    if (result.outcome === "replaced") {
      const ownerTag = result.tags[0]!;
      const otherTag = (await tags.listBySet(otherSetId, otherId))![0]!;
      expect(ownerTag.name).toBe("shared");
      expect(ownerTag.id).not.toBe(otherTag.id);
      expect(ownerTag.userId).toBe(ownerId);
    }
  });

  it("lists a user's tags alphabetically and hides other users'", async () => {
    await tags.replace(setId, ownerId, ["zeta", "alpha"]);

    const listed = await tags.listByUser(ownerId);

    // The single-case subset pins ascending order regardless of where the
    // mixed-case names sort under the database's collation.
    const names = listed.map((tag) => tag.name);
    expect(
      names.filter((name) =>
        ["alpha", "beta", "gamma", "shared", "zeta"].includes(name),
      ),
    ).toEqual(["alpha", "beta", "gamma", "shared", "zeta"]);
    expect(listed.every((tag) => tag.userId === ownerId)).toBe(true);
  });
});

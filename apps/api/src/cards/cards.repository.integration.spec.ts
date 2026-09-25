import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createDb, eq, users } from "@danisolation-recall/database";
import { SetsRepository } from "../sets/sets.repository";
import { CardsRepository } from "./cards.repository";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to run integration tests");
}

describe("CardsRepository", () => {
  const db = createDb(connectionString);
  const cards = new CardsRepository(db);
  const sets = new SetsRepository(db);
  const ownerEmail = "cards.repository.owner@example.com";
  const otherEmail = "cards.repository.other@example.com";

  let ownerId!: number;
  let otherId!: number;
  let setId!: number;

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

    const set = await sets.create(ownerId, { title: "Card test set" });
    setId = set.id;
  });

  afterAll(async () => {
    await db.delete(users).where(eq(users.email, ownerEmail));
    await db.delete(users).where(eq(users.email, otherEmail));
    await db.$client.end();
  });

  it("creates a card appended to the end of the set's order", async () => {
    const first = await cards.create(setId, ownerId, {
      front: "Front 1",
      back: "Back 1",
    });
    expect(first?.position).toBe(1);
    expect(first?.front).toBe("Front 1");

    const second = await cards.create(setId, ownerId, {
      front: "Front 2",
      back: "Back 2",
    });
    expect(second?.position).toBe(2);
  });

  it("does not create a card in another user's set", async () => {
    const foreignSet = await sets.create(otherId, { title: "Foreign set" });

    const created = await cards.create(foreignSet.id, ownerId, {
      front: "Stolen",
      back: "Nope",
    });

    expect(created).toBeNull();
  });

  it("does not create a card in an unknown set", async () => {
    const created = await cards.create(99_999_999, ownerId, {
      front: "Nowhere",
      back: "Nope",
    });

    expect(created).toBeNull();
  });

  it("finds a card by id for its owner", async () => {
    const created = await cards.create(setId, ownerId, {
      front: "Findable front",
      back: "Findable back",
    });

    const found = await cards.findById(created!.id, setId, ownerId);

    expect(found?.front).toBe("Findable front");
    expect(found?.back).toBe("Findable back");
  });

  it("does not find a card for another user", async () => {
    const created = await cards.create(setId, ownerId, {
      front: "Private front",
      back: "Private back",
    });

    const found = await cards.findById(created!.id, setId, otherId);

    expect(found).toBeNull();
  });

  it("returns null for an unknown card id", async () => {
    const found = await cards.findById(99_999_999, setId, ownerId);

    expect(found).toBeNull();
  });

  it("lists the set's cards in study order", async () => {
    const listSet = await sets.create(ownerId, { title: "Ordered set" });
    await cards.create(listSet.id, ownerId, { front: "A", back: "a" });
    await cards.create(listSet.id, ownerId, { front: "B", back: "b" });
    await cards.create(listSet.id, ownerId, { front: "C", back: "c" });

    const listed = await cards.listBySet(listSet.id, ownerId, {
      limit: 10,
      offset: 0,
    });

    expect(listed?.map((card) => card.front)).toEqual(["A", "B", "C"]);
    expect(listed?.map((card) => card.position)).toEqual([1, 2, 3]);
  });

  it("excludes other sets' cards from the list", async () => {
    const foreignSet = await sets.create(otherId, { title: "Other's set" });
    await cards.create(foreignSet.id, otherId, {
      front: "Not yours",
      back: "no",
    });

    const listed = await cards.listBySet(setId, ownerId, {
      limit: 100,
      offset: 0,
    });

    expect(listed?.map((card) => card.front)).not.toContain("Not yours");
  });

  it("reports listing a foreign set as not found", async () => {
    const foreignSet = await sets.create(otherId, { title: "Hidden set" });

    const listed = await cards.listBySet(foreignSet.id, ownerId, {
      limit: 10,
      offset: 0,
    });

    expect(listed).toBeNull();
  });

  it("paginates with limit and offset", async () => {
    const pageSet = await sets.create(ownerId, { title: "Paged set" });
    await cards.create(pageSet.id, ownerId, { front: "P1", back: "p" });
    await cards.create(pageSet.id, ownerId, { front: "P2", back: "p" });
    await cards.create(pageSet.id, ownerId, { front: "P3", back: "p" });

    const pageOne = await cards.listBySet(pageSet.id, ownerId, {
      limit: 2,
      offset: 0,
    });
    const pageTwo = await cards.listBySet(pageSet.id, ownerId, {
      limit: 2,
      offset: 2,
    });

    expect(pageOne?.map((card) => card.front)).toEqual(["P1", "P2"]);
    expect(pageTwo?.map((card) => card.front)).toEqual(["P3"]);
  });

  it("updates only the provided fields", async () => {
    const created = await cards.create(setId, ownerId, {
      front: "Before front",
      back: "Before back",
    });

    const updated = await cards.update(created!.id, setId, ownerId, {
      front: "After front",
    });

    expect(updated?.front).toBe("After front");
    expect(updated?.back).toBe("Before back");
    expect(updated!.updatedAt.getTime()).toBeGreaterThanOrEqual(
      created!.updatedAt.getTime(),
    );
  });

  it("does not update another user's card", async () => {
    const created = await cards.create(setId, ownerId, {
      front: "Untouched front",
      back: "Untouched back",
    });

    const updated = await cards.update(created!.id, setId, otherId, {
      front: "Hijacked",
    });

    expect(updated).toBeNull();

    const found = await cards.findById(created!.id, setId, ownerId);
    expect(found?.front).toBe("Untouched front");
  });

  it("deletes a card", async () => {
    const created = await cards.create(setId, ownerId, {
      front: "Doomed front",
      back: "Doomed back",
    });

    const deleted = await cards.delete(created!.id, setId, ownerId);

    expect(deleted).toBe(true);
    expect(await cards.findById(created!.id, setId, ownerId)).toBeNull();
  });

  it("reports deleting another user's card as not found", async () => {
    const created = await cards.create(setId, ownerId, {
      front: "Survivor front",
      back: "Survivor back",
    });

    const deleted = await cards.delete(created!.id, setId, otherId);

    expect(deleted).toBe(false);

    const found = await cards.findById(created!.id, setId, ownerId);
    expect(found?.front).toBe("Survivor front");
  });

  it("moves a card to an earlier position", async () => {
    const moveSet = await sets.create(ownerId, { title: "Move up set" });
    const a = await cards.create(moveSet.id, ownerId, { front: "A", back: "a" });
    const b = await cards.create(moveSet.id, ownerId, { front: "B", back: "b" });
    const c = await cards.create(moveSet.id, ownerId, { front: "C", back: "c" });

    const moved = await cards.move(c!.id, moveSet.id, ownerId, 1);

    expect(moved?.front).toBe("C");

    const listed = await cards.listBySet(moveSet.id, ownerId, {
      limit: 10,
      offset: 0,
    });
    expect(listed?.map((card) => card.front)).toEqual(["C", "A", "B"]);
    expect(listed?.map((card) => card.id)).toEqual([c!.id, a!.id, b!.id]);
  });

  it("moves a card to a later position", async () => {
    const moveSet = await sets.create(ownerId, { title: "Move down set" });
    const a = await cards.create(moveSet.id, ownerId, { front: "A", back: "a" });
    const b = await cards.create(moveSet.id, ownerId, { front: "B", back: "b" });
    const c = await cards.create(moveSet.id, ownerId, { front: "C", back: "c" });

    const moved = await cards.move(a!.id, moveSet.id, ownerId, 3);

    expect(moved?.front).toBe("A");

    const listed = await cards.listBySet(moveSet.id, ownerId, {
      limit: 10,
      offset: 0,
    });
    expect(listed?.map((card) => card.front)).toEqual(["B", "C", "A"]);
  });

  it("keeps the order when a card moves to its own position", async () => {
    const moveSet = await sets.create(ownerId, { title: "Noop set" });
    await cards.create(moveSet.id, ownerId, { front: "A", back: "a" });
    const b = await cards.create(moveSet.id, ownerId, { front: "B", back: "b" });

    const moved = await cards.move(b!.id, moveSet.id, ownerId, 2);

    expect(moved?.front).toBe("B");

    const listed = await cards.listBySet(moveSet.id, ownerId, {
      limit: 10,
      offset: 0,
    });
    expect(listed?.map((card) => card.front)).toEqual(["A", "B"]);
  });

  it("clamps an out-of-range move target to the bounds", async () => {
    const moveSet = await sets.create(ownerId, { title: "Clamp set" });
    await cards.create(moveSet.id, ownerId, { front: "A", back: "a" });
    await cards.create(moveSet.id, ownerId, { front: "B", back: "b" });
    const c = await cards.create(moveSet.id, ownerId, { front: "C", back: "c" });

    const moved = await cards.move(c!.id, moveSet.id, ownerId, 99);

    expect(moved?.front).toBe("C");

    const listed = await cards.listBySet(moveSet.id, ownerId, {
      limit: 10,
      offset: 0,
    });
    expect(listed?.map((card) => card.front)).toEqual(["A", "B", "C"]);
  });

  it("does not move another user's card", async () => {
    const moveSet = await sets.create(ownerId, { title: "Guarded set" });
    await cards.create(moveSet.id, ownerId, { front: "A", back: "a" });
    const b = await cards.create(moveSet.id, ownerId, { front: "B", back: "b" });

    const moved = await cards.move(b!.id, moveSet.id, otherId, 1);

    expect(moved).toBeNull();

    const listed = await cards.listBySet(moveSet.id, ownerId, {
      limit: 10,
      offset: 0,
    });
    expect(listed?.map((card) => card.front)).toEqual(["A", "B"]);
  });
});

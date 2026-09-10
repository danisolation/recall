import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createDb, eq, users } from "@danisolation-recall/database";
import { UsersRepository } from "./users.repository";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to run integration tests");
}

describe("UsersRepository", () => {
  const db = createDb(connectionString);
  const repository = new UsersRepository(db);
  const email = "users.repository.integration@example.com";

  beforeAll(async () => {
    await db.delete(users).where(eq(users.email, email));
  });

  afterAll(async () => {
    await db.delete(users).where(eq(users.email, email));
    await db.$client.end();
  });

  it("creates a user", async () => {
    const user = await repository.create({ email, passwordHash: "hashed" });

    expect(user.id).toBeGreaterThan(0);
    expect(user.email).toBe(email);
    expect(user.passwordHash).toBe("hashed");
  });

  it("finds a user by email", async () => {
    const user = await repository.findByEmail(email);

    expect(user?.email).toBe(email);
  });

  it("returns null for an unknown email", async () => {
    const user = await repository.findByEmail("missing@example.com");

    expect(user).toBeNull();
  });

  it("finds a user by id", async () => {
    const found = await repository.findByEmail(email);

    expect(found).not.toBeNull();
    const user = await repository.findById(found!.id);

    expect(user?.id).toBe(found!.id);
    expect(user?.email).toBe(email);
  });
});

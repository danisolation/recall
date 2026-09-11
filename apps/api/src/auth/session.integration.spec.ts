import { createDb, eq, sessions, users } from "@danisolation-recall/database";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { hashToken, SessionService } from "./session";
import { UsersRepository } from "./users.repository";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to run integration tests");
}

describe("SessionService (integration)", () => {
  const db = createDb(connectionString);
  const sessionService = new SessionService(db);
  const usersRepository = new UsersRepository(db);
  const email = "session.integration@example.com";

  let userId: number;

  beforeAll(async () => {
    await db.delete(users).where(eq(users.email, email));
    const user = await usersRepository.create({
      email,
      passwordHash: "hashed",
    });
    userId = user.id;
  });

  afterAll(async () => {
    await db.delete(users).where(eq(users.email, email));
    await db.$client.end();
  });

  it("issues a session and persists only the token hash", async () => {
    const { token, expiresAt } = await sessionService.issue(userId);

    expect(expiresAt.getTime()).toBeGreaterThan(Date.now());

    const [row] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, userId));

    expect(row).toBeDefined();
    expect(row?.tokenHash).toBe(hashToken(token));
    expect(row?.tokenHash).not.toContain(token);
  });

  it("returns the user for a valid token", async () => {
    const { token } = await sessionService.issue(userId);

    const user = await sessionService.findUserByToken(token);

    expect(user?.id).toBe(userId);
    expect(user?.email).toBe(email);
  });

  it("returns null for an unknown token", async () => {
    const user = await sessionService.findUserByToken("no-such-token");

    expect(user).toBeNull();
  });

  it("returns null for an expired session", async () => {
    await db.insert(sessions).values({
      userId,
      tokenHash: hashToken("expired-token"),
      expiresAt: new Date(Date.now() - 1000),
    });

    const user = await sessionService.findUserByToken("expired-token");

    expect(user).toBeNull();
  });

  it("revokes a token so it no longer validates", async () => {
    const { token } = await sessionService.issue(userId);

    const before = await sessionService.findUserByToken(token);
    expect(before).not.toBeNull();

    await sessionService.revoke(token);

    const after = await sessionService.findUserByToken(token);
    expect(after).toBeNull();
  });
});

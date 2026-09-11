import { createHash, randomBytes } from "node:crypto";
import { Inject, Injectable } from "@nestjs/common";
import { and, eq, gt, sessions, users } from "@danisolation-recall/database";
import { DATABASE_PROVIDER, type Database } from "../database/database.module";
import { type User } from "./users.repository";

export const SESSION_COOKIE_NAME = "session_token";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type IssuedSession = {
  token: string;
  expiresAt: Date;
};

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function createSessionToken(now: Date): IssuedSession & { tokenHash: string } {
  const token = randomBytes(32).toString("base64url");
  return {
    token,
    tokenHash: hashToken(token),
    expiresAt: new Date(now.getTime() + SESSION_TTL_MS),
  };
}

@Injectable()
export class SessionService {
  constructor(@Inject(DATABASE_PROVIDER) private readonly db: Database) {}

  async issue(userId: number, now: Date = new Date()): Promise<IssuedSession> {
    const session = createSessionToken(now);
    await this.db.insert(sessions).values({
      userId,
      tokenHash: session.tokenHash,
      expiresAt: session.expiresAt,
    });
    return { token: session.token, expiresAt: session.expiresAt };
  }

  async findUserByToken(token: string): Promise<User | null> {
    const [row] = await this.db
      .select({ user: users })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(
        and(
          eq(sessions.tokenHash, hashToken(token)),
          gt(sessions.expiresAt, new Date()),
        ),
      )
      .limit(1);

    return row?.user ?? null;
  }

  async revoke(token: string): Promise<void> {
    await this.db
      .delete(sessions)
      .where(eq(sessions.tokenHash, hashToken(token)));
  }
}

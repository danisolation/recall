import { Inject, Injectable } from "@nestjs/common";
import {
  and,
  asc,
  desc,
  eq,
  sql,
  cards,
  reviews,
  studySessions,
  studySets,
  userCardProgress,
} from "@danisolation-recall/database";
import { DATABASE_PROVIDER, type Database } from "../database/database.module";
import { schedule } from "./schedule";

export type StudySession = typeof studySessions.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Progress = typeof userCardProgress.$inferSelect;
export type StudyCard = typeof cards.$inferSelect;

export type TransitionResult =
  | { outcome: "transitioned"; session: StudySession }
  | { outcome: "unchanged"; session: StudySession }
  | { outcome: "conflict"; session: StudySession }
  | { outcome: "notFound" };

export type RecordReviewResult =
  | { outcome: "recorded"; review: Review; progress: Progress }
  | { outcome: "duplicate" }
  | { outcome: "sessionNotActive" }
  | { outcome: "cardNotInSet" }
  | { outcome: "notFound" };

@Injectable()
export class SessionsRepository {
  constructor(@Inject(DATABASE_PROVIDER) private readonly db: Database) {}

  // Creates an ACTIVE session for a set the caller owns; a foreign or
  // unknown set is indistinguishable from missing (§41, ADR-009).
  async create(userId: number, setId: number): Promise<StudySession | null> {
    const [set] = await this.db
      .select({ id: studySets.id })
      .from(studySets)
      .where(and(eq(studySets.id, setId), eq(studySets.ownerId, userId)))
      .limit(1);

    if (!set) {
      return null;
    }

    const [session] = await this.db
      .insert(studySessions)
      .values({ userId, setId, status: "ACTIVE" })
      .returning();

    return session ?? null;
  }

  async findById(
    sessionId: number,
    userId: number,
  ): Promise<StudySession | null> {
    const [session] = await this.db
      .select()
      .from(studySessions)
      .where(
        and(
          eq(studySessions.id, sessionId),
          eq(studySessions.userId, userId),
        ),
      )
      .limit(1);

    return session ?? null;
  }

  async listByUser(
    userId: number,
    page: { limit: number; offset: number },
  ): Promise<StudySession[]> {
    return this.db
      .select()
      .from(studySessions)
      .where(eq(studySessions.userId, userId))
      .orderBy(desc(studySessions.id))
      .limit(page.limit)
      .offset(page.offset);
  }

  // Terminal transitions per ADR-009: ACTIVE → target, repeat transition is
  // an unchanged no-op, the other terminal state is a conflict.
  async complete(sessionId: number, userId: number): Promise<TransitionResult> {
    return this.transition(sessionId, userId, "COMPLETED");
  }

  async abandon(sessionId: number, userId: number): Promise<TransitionResult> {
    return this.transition(sessionId, userId, "ABANDONED");
  }

  // Records a review and upserts the card's progress in one transaction
  // (§34): a review without its progress update must be impossible. The
  // (session_id, card_id) unique constraint (STUDY-003) makes the
  // one-review-per-card rule race-proof; the violation surfaces as
  // "duplicate" for the service to translate into 409 (ADR-009).
  async addReview(
    sessionId: number,
    userId: number,
    cardId: number,
    correct: boolean,
    now: Date,
  ): Promise<RecordReviewResult> {
    return this.db.transaction(async (tx) => {
      const [session] = await tx
        .select()
        .from(studySessions)
        .where(
          and(
            eq(studySessions.id, sessionId),
            eq(studySessions.userId, userId),
          ),
        )
        .limit(1);

      if (!session) {
        return { outcome: "notFound" };
      }

      if (session.status !== "ACTIVE") {
        return { outcome: "sessionNotActive" };
      }

      const [card] = await tx
        .select({ id: cards.id })
        .from(cards)
        .where(and(eq(cards.id, cardId), eq(cards.setId, session.setId)))
        .limit(1);

      if (!card) {
        return { outcome: "cardNotInSet" };
      }

      let review: Review;
      try {
        const [inserted] = await tx
          .insert(reviews)
          .values({ sessionId, cardId, correct, reviewedAt: now })
          .returning();

        if (!inserted) {
          return { outcome: "notFound" };
        }

        review = inserted;
      } catch (error) {
        // drizzle wraps driver errors, so the pg code can sit on either the
        // error or its cause.
        const pgError = error as { code?: string; cause?: { code?: string } };
        const code = pgError.code ?? pgError.cause?.code;

        if (code === "23505") {
          return { outcome: "duplicate" };
        }

        throw error;
      }

      const [existing] = await tx
        .select({ streak: userCardProgress.streak })
        .from(userCardProgress)
        .where(
          and(
            eq(userCardProgress.userId, userId),
            eq(userCardProgress.cardId, cardId),
          ),
        )
        .limit(1);

      const next = schedule(
        { streak: existing?.streak ?? 0 },
        correct,
        now,
      );

      const [progress] = await tx
        .insert(userCardProgress)
        .values({
          userId,
          cardId,
          reviewCount: 1,
          correctCount: correct ? 1 : 0,
          streak: next.streak,
          lastReviewedAt: now,
          nextReviewAt: next.nextReviewAt,
        })
        .onConflictDoUpdate({
          target: [userCardProgress.userId, userCardProgress.cardId],
          set: {
            reviewCount: sql`${userCardProgress.reviewCount} + 1`,
            correctCount: sql`${userCardProgress.correctCount} + ${correct ? 1 : 0}`,
            streak: next.streak,
            lastReviewedAt: now,
            nextReviewAt: next.nextReviewAt,
            updatedAt: now,
          },
        })
        .returning();

      if (!progress) {
        return { outcome: "notFound" };
      }

      return { outcome: "recorded", review, progress };
    });
  }

  async listReviewsBySession(
    sessionId: number,
    userId: number,
  ): Promise<Review[]> {
    return this.db
      .select({ review: reviews })
      .from(reviews)
      .innerJoin(
        studySessions,
        eq(reviews.sessionId, studySessions.id),
      )
      .where(
        and(
          eq(reviews.sessionId, sessionId),
          eq(studySessions.userId, userId),
        ),
      )
      .orderBy(asc(reviews.reviewedAt), asc(reviews.id))
      .then((rows) => rows.map((row) => row.review));
  }

  // The set's current cards in study order, scoped through the session's
  // ownership; a foreign or unknown session is indistinguishable from
  // missing (§41).
  async listSessionCards(
    sessionId: number,
    userId: number,
  ): Promise<StudyCard[] | null> {
    const [session] = await this.db
      .select({ setId: studySessions.setId })
      .from(studySessions)
      .where(
        and(
          eq(studySessions.id, sessionId),
          eq(studySessions.userId, userId),
        ),
      )
      .limit(1);

    if (!session) {
      return null;
    }

    return this.db
      .select()
      .from(cards)
      .where(eq(cards.setId, session.setId))
      .orderBy(asc(cards.position), asc(cards.id));
  }

  private async transition(
    sessionId: number,
    userId: number,
    target: "COMPLETED" | "ABANDONED",
  ): Promise<TransitionResult> {
    const [updated] = await this.db
      .update(studySessions)
      .set({ status: target, finishedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(studySessions.id, sessionId),
          eq(studySessions.userId, userId),
          eq(studySessions.status, "ACTIVE"),
        ),
      )
      .returning();

    if (updated) {
      return { outcome: "transitioned", session: updated };
    }

    const [session] = await this.db
      .select()
      .from(studySessions)
      .where(
        and(
          eq(studySessions.id, sessionId),
          eq(studySessions.userId, userId),
        ),
      )
      .limit(1);

    if (!session) {
      return { outcome: "notFound" };
    }

    if (session.status === target) {
      return { outcome: "unchanged", session };
    }

    return { outcome: "conflict", session };
  }
}

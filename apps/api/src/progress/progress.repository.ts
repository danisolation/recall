import { Inject, Injectable } from "@nestjs/common";
import {
  and,
  asc,
  count,
  eq,
  isNotNull,
  lte,
  sql,
  cards,
  reviews,
  studySessions,
  studySets,
  userCardProgress,
} from "@danisolation-recall/database";
import { DATABASE_PROVIDER, type Database } from "../database/database.module";

export type ProgressSummary = {
  totalReviews: number;
  correctReviews: number;
};

// ADR-010: identity and destination, not the back — the queue links to the
// set where studying happens.
export type DueCard = {
  cardId: number;
  front: string;
  setId: number;
  setTitle: string;
  nextReviewAt: Date;
};

@Injectable()
export class ProgressRepository {
  constructor(@Inject(DATABASE_PROVIDER) private readonly db: Database) {}

  // Reviews reach their user through the session, so ownership is one join
  // in SQL (§41); the correct share is a single filtered count, not two
  // queries.
  async getSummary(userId: number): Promise<ProgressSummary> {
    const [row] = await this.db
      .select({
        totalReviews: count(),
        correctReviews:
          sql<number>`count(*) filter (where ${reviews.correct})`.mapWith(
            Number,
          ),
      })
      .from(reviews)
      .innerJoin(studySessions, eq(reviews.sessionId, studySessions.id))
      .where(eq(studySessions.userId, userId));

    return {
      totalReviews: Number(row?.totalReviews ?? 0),
      correctReviews: Number(row?.correctReviews ?? 0),
    };
  }

  // ADR-010's due rule: the ladder scheduled this card at or before now.
  // Never-reviewed rows (null next_review_at) are not due; ordering is
  // most-overdue first with the card id as the tiebreaker, since same-
  // transaction timestamps can be identical.
  async listDue(
    userId: number,
    now: Date,
    page: { limit: number; offset: number },
  ): Promise<DueCard[]> {
    const rows = await this.db
      .select({
        cardId: cards.id,
        front: cards.front,
        setId: studySets.id,
        setTitle: studySets.title,
        nextReviewAt: userCardProgress.nextReviewAt,
      })
      .from(userCardProgress)
      .innerJoin(cards, eq(userCardProgress.cardId, cards.id))
      .innerJoin(studySets, eq(cards.setId, studySets.id))
      .where(
        and(
          eq(userCardProgress.userId, userId),
          isNotNull(userCardProgress.nextReviewAt),
          lte(userCardProgress.nextReviewAt, now),
        ),
      )
      .orderBy(asc(userCardProgress.nextReviewAt), asc(cards.id))
      .limit(page.limit)
      .offset(page.offset);

    // The WHERE clause excludes null next_review_at; the column's nullable
    // type cannot express that, so the narrowing happens here.
    return rows.map((row) => ({
      ...row,
      nextReviewAt: row.nextReviewAt as Date,
    }));
  }

  // The summary's due count: the listDue predicate aggregated in SQL, so
  // the summary stays three cheap reads instead of listing rows.
  async countDue(userId: number, now: Date): Promise<number> {
    const [row] = await this.db
      .select({ dueCount: count() })
      .from(userCardProgress)
      .where(
        and(
          eq(userCardProgress.userId, userId),
          isNotNull(userCardProgress.nextReviewAt),
          lte(userCardProgress.nextReviewAt, now),
        ),
      );

    return Number(row?.dueCount ?? 0);
  }
}

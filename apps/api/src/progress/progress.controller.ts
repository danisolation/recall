import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { AuthGuard, CurrentUser } from "../auth/auth.guard";
import { type User } from "../auth/users.repository";
import {
  type DueCard,
  type ProgressSummary,
  ProgressRepository,
} from "./progress.repository";
import { computeDailyStreaks } from "./streaks";

// ADR-010: facts only — accuracy is derived client-side from the counts.
// ADR-016: the two streak facts ride the same response — one fetch, no
// new endpoint.
export type ProgressResponse = ProgressSummary & {
  dueCount: number;
  currentStreak: number;
  longestStreak: number;
};

// File-local like every list query schema — the web constructs no queries
// it needs to validate client-side yet (the list-sets precedent).
const listDueQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit must be at most 100")
    .default(20),
  offset: z.coerce
    .number()
    .int()
    .min(0, "Offset must be at least 0")
    .default(0),
});

export class ListDueQueryDto extends createZodDto(listDueQuerySchema) {}

export type PaginatedDueCards = {
  items: DueCard[];
  nextOffset: number | null;
};

@Controller("progress")
export class ProgressController {
  constructor(private readonly progressRepository: ProgressRepository) {}

  @Get()
  @UseGuards(AuthGuard)
  async getSummary(@CurrentUser() user: User): Promise<ProgressResponse> {
    const now = new Date();
    const [summary, dueCount, reviewDays] = await Promise.all([
      this.progressRepository.getSummary(user.id),
      this.progressRepository.countDue(user.id, now),
      this.progressRepository.listReviewDays(user.id),
    ]);
    const streaks = computeDailyStreaks(reviewDays, now);

    return {
      totalReviews: summary.totalReviews,
      correctReviews: summary.correctReviews,
      dueCount,
      currentStreak: streaks.currentStreak,
      longestStreak: streaks.longestStreak,
    };
  }

  @Get("due")
  @UseGuards(AuthGuard)
  async listDue(
    @CurrentUser() user: User,
    @Query() query: ListDueQueryDto,
  ): Promise<PaginatedDueCards> {
    const items = await this.progressRepository.listDue(
      user.id,
      new Date(),
      { limit: query.limit, offset: query.offset },
    );

    return {
      items,
      nextOffset:
        items.length === query.limit ? query.offset + query.limit : null,
    };
  }
}

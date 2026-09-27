import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard, CurrentUser } from "../auth/auth.guard";
import { type User } from "../auth/users.repository";
import {
  type ProgressSummary,
  ProgressRepository,
} from "./progress.repository";

// ADR-010: facts only — accuracy is derived client-side from the counts.
export type ProgressResponse = ProgressSummary & {
  dueCount: number;
};

@Controller("progress")
export class ProgressController {
  constructor(private readonly progressRepository: ProgressRepository) {}

  @Get()
  @UseGuards(AuthGuard)
  async getSummary(@CurrentUser() user: User): Promise<ProgressResponse> {
    const now = new Date();
    const [summary, dueCount] = await Promise.all([
      this.progressRepository.getSummary(user.id),
      this.progressRepository.countDue(user.id, now),
    ]);

    return {
      totalReviews: summary.totalReviews,
      correctReviews: summary.correctReviews,
      dueCount,
    };
  }
}

import { Injectable } from "@nestjs/common";
import { type ReviewInput } from "@danisolation-recall/contracts";
import {
  type RecordReviewResult,
  SessionsRepository,
} from "./sessions.repository";

@Injectable()
export class RecordReviewService {
  constructor(private readonly sessionsRepository: SessionsRepository) {}

  async record(
    userId: number,
    sessionId: number,
    input: ReviewInput,
  ): Promise<RecordReviewResult> {
    // now enters here, at the application boundary, and flows into the
    // transaction as one value for the review, the progress upsert, and
    // the scheduler (§49).
    return this.sessionsRepository.addReview(
      sessionId,
      userId,
      input.cardId,
      input.correct,
      new Date(),
    );
  }
}

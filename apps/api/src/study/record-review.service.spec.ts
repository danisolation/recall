import { describe, expect, it, vi } from "vitest";
import { RecordReviewService } from "./record-review.service";
import type { SessionsRepository } from "./sessions.repository";

function createSessionsRepositoryMock() {
  return {
    addReview: vi.fn(),
  } as unknown as SessionsRepository;
}

describe("RecordReviewService", () => {
  it("passes the review and an explicit now to the repository and returns the recorded result", async () => {
    const sessionsRepository = createSessionsRepositoryMock();
    const reviewedAt = new Date("2026-09-26T12:00:00.000Z");
    const review = {
      id: 1,
      sessionId: 5,
      cardId: 11,
      correct: true,
      reviewedAt,
    };
    const progress = {
      id: 1,
      userId: 7,
      cardId: 11,
      reviewCount: 1,
      correctCount: 1,
      streak: 1,
      lastReviewedAt: reviewedAt,
      nextReviewAt: new Date(reviewedAt.getTime() + 24 * 60 * 60_000),
      createdAt: reviewedAt,
      updatedAt: reviewedAt,
    };
    vi.mocked(sessionsRepository.addReview).mockResolvedValue({
      outcome: "recorded",
      review,
      progress,
    });

    const service = new RecordReviewService(sessionsRepository);
    const result = await service.record(7, 5, { cardId: 11, correct: true });

    expect(sessionsRepository.addReview).toHaveBeenCalledWith(
      5,
      7,
      11,
      true,
      expect.any(Date),
    );
    expect(result).toEqual({ outcome: "recorded", review, progress });
  });

  it("passes failure outcomes through unchanged for the controller to translate", async () => {
    const sessionsRepository = createSessionsRepositoryMock();
    vi.mocked(sessionsRepository.addReview).mockResolvedValue({
      outcome: "duplicate",
    });

    const service = new RecordReviewService(sessionsRepository);
    const result = await service.record(7, 5, { cardId: 11, correct: false });

    expect(result).toEqual({ outcome: "duplicate" });
  });
});

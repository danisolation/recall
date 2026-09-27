import {
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { reviewSchema, startSessionSchema } from "@danisolation-recall/contracts";
import { createZodDto } from "nestjs-zod";
import { AuthGuard, CurrentUser } from "../auth/auth.guard";
import { type User } from "../auth/users.repository";
import {
  type Review,
  type StudyCard,
  type StudySession,
  SessionsRepository,
} from "./sessions.repository";
import { RecordReviewService } from "./record-review.service";
import { type StartSessionResult, StartSessionService } from "./start-session.service";

export class StartSessionDto extends createZodDto(startSessionSchema) {}

export class ReviewDto extends createZodDto(reviewSchema) {}

// ADR-009: a resume is one fetch — session, its reviews, and the set's
// current ordered cards.
export type GetSessionResult = {
  session: StudySession;
  reviews: Review[];
  cards: StudyCard[];
};

function parseSessionId(sessionId: string): number {
  const id = Number(sessionId);

  if (!Number.isInteger(id)) {
    throw new NotFoundException({
      code: "SESSION_NOT_FOUND",
      message: "Study session not found",
    });
  }

  return id;
}

@Controller("study-sessions")
export class SessionsController {
  constructor(
    private readonly startSessionService: StartSessionService,
    private readonly recordReviewService: RecordReviewService,
    private readonly sessionsRepository: SessionsRepository,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  async start(
    @CurrentUser() user: User,
    @Body() body: StartSessionDto,
  ): Promise<StartSessionResult> {
    const result = await this.startSessionService.start(user.id, body);

    if (!result) {
      throw new NotFoundException({
        code: "SET_NOT_FOUND",
        message: "Study set not found",
      });
    }

    return result;
  }

  @Get(":id")
  @UseGuards(AuthGuard)
  async get(
    @CurrentUser() user: User,
    @Param("id") sessionId: string,
  ): Promise<GetSessionResult> {
    const session = await this.sessionsRepository.findById(
      parseSessionId(sessionId),
      user.id,
    );

    if (!session) {
      throw new NotFoundException({
        code: "SESSION_NOT_FOUND",
        message: "Study session not found",
      });
    }

    const [reviews, cards] = await Promise.all([
      this.sessionsRepository.listReviewsBySession(session.id, user.id),
      this.sessionsRepository.listSessionCards(session.id, user.id),
    ]);

    // The session is confirmed owned, so the owner-scoped card lookup
    // cannot miss; the fallback only satisfies the type.
    return { session, reviews, cards: cards ?? [] };
  }

  @Post(":id/reviews")
  @UseGuards(AuthGuard)
  async recordReview(
    @CurrentUser() user: User,
    @Param("id") sessionId: string,
    @Body() body: ReviewDto,
  ): Promise<Review> {
    const result = await this.recordReviewService.record(
      user.id,
      parseSessionId(sessionId),
      body,
    );

    if (result.outcome === "recorded") {
      return result.review;
    }

    if (result.outcome === "duplicate") {
      throw new ConflictException({
        code: "REVIEW_ALREADY_RECORDED",
        message: "This card was already answered in this session",
      });
    }

    if (result.outcome === "sessionNotActive") {
      throw new ConflictException({
        code: "INVALID_STUDY_SESSION",
        message: "This session no longer accepts reviews",
      });
    }

    if (result.outcome === "cardNotInSet") {
      throw new NotFoundException({
        code: "CARD_NOT_FOUND",
        message: "Card not found",
      });
    }

    throw new NotFoundException({
      code: "SESSION_NOT_FOUND",
      message: "Study session not found",
    });
  }

  // ADR-009: finishing a COMPLETED session again is an idempotent no-op
  // success; only the other terminal state is a conflict.
  @Post(":id/finish")
  @HttpCode(200)
  @UseGuards(AuthGuard)
  async finish(
    @CurrentUser() user: User,
    @Param("id") sessionId: string,
  ): Promise<StudySession> {
    return this.transitionSession(parseSessionId(sessionId), user.id, "finish");
  }

  @Post(":id/abandon")
  @HttpCode(200)
  @UseGuards(AuthGuard)
  async abandon(
    @CurrentUser() user: User,
    @Param("id") sessionId: string,
  ): Promise<StudySession> {
    return this.transitionSession(
      parseSessionId(sessionId),
      user.id,
      "abandon",
    );
  }

  private async transitionSession(
    sessionId: number,
    userId: number,
    action: "finish" | "abandon",
  ): Promise<StudySession> {
    const result =
      action === "finish"
        ? await this.sessionsRepository.complete(sessionId, userId)
        : await this.sessionsRepository.abandon(sessionId, userId);

    if (result.outcome === "conflict") {
      throw new ConflictException({
        code: "INVALID_STUDY_SESSION",
        message: "This session is already finished",
      });
    }

    if (result.outcome === "notFound") {
      throw new NotFoundException({
        code: "SESSION_NOT_FOUND",
        message: "Study session not found",
      });
    }

    return result.session;
  }
}

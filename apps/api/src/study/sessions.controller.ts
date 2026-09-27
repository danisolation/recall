import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { startSessionSchema } from "@danisolation-recall/contracts";
import { createZodDto } from "nestjs-zod";
import { AuthGuard, CurrentUser } from "../auth/auth.guard";
import { type User } from "../auth/users.repository";
import {
  type Review,
  type StudyCard,
  type StudySession,
  SessionsRepository,
} from "./sessions.repository";
import { type StartSessionResult, StartSessionService } from "./start-session.service";

export class StartSessionDto extends createZodDto(startSessionSchema) {}

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
}

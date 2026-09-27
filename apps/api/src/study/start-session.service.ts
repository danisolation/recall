import { Injectable } from "@nestjs/common";
import { type StartSessionInput } from "@danisolation-recall/contracts";
import {
  type StudyCard,
  type StudySession,
  SessionsRepository,
} from "./sessions.repository";

// ADR-009: the start payload carries the session and the set's current
// ordered cards so the study screen renders its first card from this
// response alone.
export type StartSessionResult = {
  session: StudySession;
  cards: StudyCard[];
};

@Injectable()
export class StartSessionService {
  constructor(private readonly sessionsRepository: SessionsRepository) {}

  async start(
    userId: number,
    input: StartSessionInput,
  ): Promise<StartSessionResult | null> {
    const session = await this.sessionsRepository.create(userId, input.setId);

    if (!session) {
      return null;
    }

    const cards = await this.sessionsRepository.listSessionCards(
      session.id,
      userId,
    );

    // The session was just created for this user, so the owner-scoped card
    // lookup cannot miss; the fallback only satisfies the type.
    return { session, cards: cards ?? [] };
  }
}

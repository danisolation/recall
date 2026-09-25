import { Injectable } from "@nestjs/common";
import { type CreateCardInput } from "@danisolation-recall/contracts";
import { type Card, CardsRepository } from "./cards.repository";

@Injectable()
export class CreateCardService {
  constructor(private readonly cardsRepository: CardsRepository) {}

  // Returns null when the set is missing or foreign; the controller 404s.
  async create(
    ownerId: number,
    setId: number,
    input: CreateCardInput,
  ): Promise<Card | null> {
    return this.cardsRepository.create(setId, ownerId, input);
  }
}

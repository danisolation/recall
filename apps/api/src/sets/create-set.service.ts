import { Injectable } from "@nestjs/common";
import { type CreateSetInput } from "@danisolation-recall/contracts";
import { type StudySet, SetsRepository } from "./sets.repository";

@Injectable()
export class CreateSetService {
  constructor(private readonly setsRepository: SetsRepository) {}

  async create(ownerId: number, input: CreateSetInput): Promise<StudySet> {
    return this.setsRepository.create(ownerId, input);
  }
}

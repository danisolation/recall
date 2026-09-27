import { Injectable, NotFoundException } from "@nestjs/common";
import { type CreateSetInput } from "@danisolation-recall/contracts";
import { type StudySet, SetsRepository } from "./sets.repository";
import { FoldersRepository } from "../folders/folders.repository";

@Injectable()
export class CreateSetService {
  constructor(
    private readonly setsRepository: SetsRepository,
    private readonly foldersRepository: FoldersRepository,
  ) {}

  async create(ownerId: number, input: CreateSetInput): Promise<StudySet> {
    // ADR-014: a foreign folder is indistinguishable from a missing one
    // (§41) — the write is rejected with 404 FOLDER_NOT_FOUND before
    // anything is created, and the set never lands in someone else's shelf.
    if (
      typeof input.folderId === "number" &&
      !(await this.foldersRepository.isOwnedBy(input.folderId, ownerId))
    ) {
      throw new NotFoundException({
        code: "FOLDER_NOT_FOUND",
        message: "Folder not found",
      });
    }

    return this.setsRepository.create(ownerId, input);
  }
}

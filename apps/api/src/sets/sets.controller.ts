import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { createSetSchema, updateSetSchema } from "@danisolation-recall/contracts";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { AuthGuard, CurrentUser } from "../auth/auth.guard";
import { type User } from "../auth/users.repository";
import { CreateSetService } from "./create-set.service";
import { FoldersRepository } from "../folders/folders.repository";
import { type StudySet, SetsRepository } from "./sets.repository";

export class CreateSetDto extends createZodDto(createSetSchema) {}

export class UpdateSetDto extends createZodDto(updateSetSchema) {}

const listSetsQuerySchema = z.object({
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
  // ADR-011: trimmed, then capped — a search longer than 200 characters is
  // rejected, and an empty value means no filter.
  q: z
    .string()
    .transform((value) => value.trim())
    .pipe(z.string().max(200, "Search query must be at most 200 characters"))
    .optional(),
  // ADR-012: the tag filter takes the tag's id — stable and unambiguous.
  tag: z.coerce
    .number()
    .int("Tag must be a whole number")
    .positive("Tag must be a positive number")
    .optional(),
  // ADR-014: the folder filter takes the folder's id — containment over the
  // labeling layer; an unknown id yields an empty page (§41).
  folder: z.coerce
    .number()
    .int("Folder must be a whole number")
    .positive("Folder must be a positive number")
    .optional(),
});

export class ListSetsQueryDto extends createZodDto(listSetsQuerySchema) {}

export type PaginatedSets = {
  items: StudySet[];
  nextOffset: number | null;
};

function parseSetId(setId: string): number {
  const id = Number(setId);

  if (!Number.isInteger(id)) {
    throw new NotFoundException({
      code: "SET_NOT_FOUND",
      message: "Study set not found",
    });
  }

  return id;
}

// ADR-015: the app's only unauthenticated endpoint — a narrow, read-only
// view of a set that is explicitly public. The response whitelists what a
// visitor needs (title, description, cards, tags); the owner's id, the
// folder placement, and the visibility token stay out of the payload.
// Private, foreign, and missing fold into the same 404 (§41 extended to
// visibility), and no listing endpoint exists — nothing is discoverable
// that was not handed to you.
@Controller("public/sets")
export class PublicSetsController {
  constructor(private readonly setsRepository: SetsRepository) {}

  @Get(":id")
  async get(@Param("id") setId: string) {
    const result = await this.setsRepository.findPublicById(
      parseSetId(setId),
    );

    if (!result) {
      throw new NotFoundException({
        code: "SET_NOT_FOUND",
        message: "Study set not found",
      });
    }

    return {
      title: result.set.title,
      description: result.set.description,
      tags: result.tags.map((tag) => ({ id: tag.id, name: tag.name })),
      cards: result.cards.map((card) => ({
        id: card.id,
        front: card.front,
        back: card.back,
      })),
    };
  }
}

@Controller("sets")
export class SetsController {
  constructor(
    private readonly createSetService: CreateSetService,
    private readonly setsRepository: SetsRepository,
    private readonly foldersRepository: FoldersRepository,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @CurrentUser() user: User,
    @Body() body: CreateSetDto,
  ): Promise<StudySet> {
    return this.createSetService.create(user.id, body);
  }

  @Get()
  @UseGuards(AuthGuard)
  async list(
    @CurrentUser() user: User,
    @Query() query: ListSetsQueryDto,
  ): Promise<PaginatedSets> {
    const items = await this.setsRepository.listByOwner(
      user.id,
      {
        limit: query.limit,
        offset: query.offset,
      },
      query.q,
      query.tag,
      query.folder,
    );

    return {
      items,
      nextOffset:
        items.length === query.limit ? query.offset + query.limit : null,
    };
  }

  @Get(":id")
  @UseGuards(AuthGuard)
  async get(
    @CurrentUser() user: User,
    @Param("id") setId: string,
  ): Promise<StudySet> {
    const set = await this.setsRepository.findById(
      parseSetId(setId),
      user.id,
    );

    if (!set) {
      throw new NotFoundException({
        code: "SET_NOT_FOUND",
        message: "Study set not found",
      });
    }

    return set;
  }

  @Patch(":id")
  @UseGuards(AuthGuard)
  async update(
    @CurrentUser() user: User,
    @Param("id") setId: string,
    @Body() body: UpdateSetDto,
  ): Promise<StudySet> {
    // ADR-014: a numbered folderId must be one of the caller's folders —
    // a foreign folder is indistinguishable from a missing one (§41).
    if (
      typeof body.folderId === "number" &&
      !(await this.foldersRepository.isOwnedBy(body.folderId, user.id))
    ) {
      throw new NotFoundException({
        code: "FOLDER_NOT_FOUND",
        message: "Folder not found",
      });
    }

    const set = await this.setsRepository.update(
      parseSetId(setId),
      user.id,
      body,
    );

    if (!set) {
      throw new NotFoundException({
        code: "SET_NOT_FOUND",
        message: "Study set not found",
      });
    }

    return set;
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  @HttpCode(204)
  async remove(
    @CurrentUser() user: User,
    @Param("id") setId: string,
  ): Promise<void> {
    const deleted = await this.setsRepository.delete(
      parseSetId(setId),
      user.id,
    );

    if (!deleted) {
      throw new NotFoundException({
        code: "SET_NOT_FOUND",
        message: "Study set not found",
      });
    }
  }
}

import {
  Body,
  Controller,
  Get,
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

@Controller("sets")
export class SetsController {
  constructor(
    private readonly createSetService: CreateSetService,
    private readonly setsRepository: SetsRepository,
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
    const items = await this.setsRepository.listByOwner(user.id, {
      limit: query.limit,
      offset: query.offset,
    });

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
}

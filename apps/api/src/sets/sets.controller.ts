import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { createSetSchema } from "@danisolation-recall/contracts";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { AuthGuard, CurrentUser } from "../auth/auth.guard";
import { type User } from "../auth/users.repository";
import { CreateSetService } from "./create-set.service";
import { type StudySet, SetsRepository } from "./sets.repository";

export class CreateSetDto extends createZodDto(createSetSchema) {}

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
    const id = Number(setId);
    const set = Number.isInteger(id)
      ? await this.setsRepository.findById(id, user.id)
      : null;

    if (!set) {
      throw new NotFoundException({
        code: "SET_NOT_FOUND",
        message: "Study set not found",
      });
    }

    return set;
  }
}

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
import { createCardSchema } from "@danisolation-recall/contracts";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { AuthGuard, CurrentUser } from "../auth/auth.guard";
import { type User } from "../auth/users.repository";
import { type Card, CardsRepository } from "./cards.repository";
import { CreateCardService } from "./create-card.service";

export class CreateCardDto extends createZodDto(createCardSchema) {}

const listCardsQuerySchema = z.object({
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

export class ListCardsQueryDto extends createZodDto(listCardsQuerySchema) {}

export type PaginatedCards = {
  items: Card[];
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

@Controller("sets/:id/cards")
export class CardsController {
  constructor(
    private readonly createCardService: CreateCardService,
    private readonly cardsRepository: CardsRepository,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  async list(
    @CurrentUser() user: User,
    @Param("id") setId: string,
    @Query() query: ListCardsQueryDto,
  ): Promise<PaginatedCards> {
    const cards = await this.cardsRepository.listBySet(
      parseSetId(setId),
      user.id,
      { limit: query.limit, offset: query.offset },
    );

    if (cards === null) {
      throw new NotFoundException({
        code: "SET_NOT_FOUND",
        message: "Study set not found",
      });
    }

    return {
      items: cards,
      nextOffset:
        cards.length === query.limit ? query.offset + query.limit : null,
    };
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @CurrentUser() user: User,
    @Param("id") setId: string,
    @Body() body: CreateCardDto,
  ): Promise<Card> {
    const card = await this.createCardService.create(
      user.id,
      parseSetId(setId),
      body,
    );

    if (!card) {
      throw new NotFoundException({
        code: "SET_NOT_FOUND",
        message: "Study set not found",
      });
    }

    return card;
  }
}

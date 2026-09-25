import {
  Body,
  Controller,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { createCardSchema } from "@danisolation-recall/contracts";
import { createZodDto } from "nestjs-zod";
import { AuthGuard, CurrentUser } from "../auth/auth.guard";
import { type User } from "../auth/users.repository";
import { type Card } from "./cards.repository";
import { CreateCardService } from "./create-card.service";

export class CreateCardDto extends createZodDto(createCardSchema) {}

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
  constructor(private readonly createCardService: CreateCardService) {}

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

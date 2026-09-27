import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Put,
  UseGuards,
} from "@nestjs/common";
import { setTagsSchema } from "@danisolation-recall/contracts";
import { createZodDto } from "nestjs-zod";
import { AuthGuard, CurrentUser } from "../auth/auth.guard";
import { type User } from "../auth/users.repository";
import { type Tag, TagsRepository } from "./tags.repository";

export class SetTagsDto extends createZodDto(setTagsSchema) {}

// The caller's tag vocabulary — id + name for filter links and forms.
@Controller("tags")
export class TagsController {
  constructor(private readonly tagsRepository: TagsRepository) {}

  @Get()
  @UseGuards(AuthGuard)
  async list(@CurrentUser() user: User): Promise<Tag[]> {
    return this.tagsRepository.listByUser(user.id);
  }
}

// ADR-012: replacing the set's tag list is the assignment contract — one
// idempotent PUT per save, mounted at the set-scoped path like the cards
// controller (CARD-004). The GET serves the detail page's tag display.
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

@Controller("sets/:id/tags")
export class SetTagsController {
  constructor(private readonly tagsRepository: TagsRepository) {}

  @Get()
  @UseGuards(AuthGuard)
  async list(
    @CurrentUser() user: User,
    @Param("id") setId: string,
  ): Promise<Tag[]> {
    const tags = await this.tagsRepository.listBySet(
      parseSetId(setId),
      user.id,
    );

    if (tags === null) {
      throw new NotFoundException({
        code: "SET_NOT_FOUND",
        message: "Study set not found",
      });
    }

    return tags;
  }

  @Put()
  @UseGuards(AuthGuard)
  async replace(
    @CurrentUser() user: User,
    @Param("id") setId: string,
    @Body() body: SetTagsDto,
  ): Promise<Tag[]> {
    const result = await this.tagsRepository.replace(
      parseSetId(setId),
      user.id,
      body.tags,
    );

    if (result.outcome === "notFound") {
      throw new NotFoundException({
        code: "SET_NOT_FOUND",
        message: "Study set not found",
      });
    }

    return result.tags;
  }
}

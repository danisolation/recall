import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { createSetSchema } from "@danisolation-recall/contracts";
import { createZodDto } from "nestjs-zod";
import { AuthGuard, CurrentUser } from "../auth/auth.guard";
import { type User } from "../auth/users.repository";
import { CreateSetService } from "./create-set.service";
import { type StudySet } from "./sets.repository";

export class CreateSetDto extends createZodDto(createSetSchema) {}

@Controller("sets")
export class SetsController {
  constructor(private readonly createSetService: CreateSetService) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @CurrentUser() user: User,
    @Body() body: CreateSetDto,
  ): Promise<StudySet> {
    return this.createSetService.create(user.id, body);
  }
}

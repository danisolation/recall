import {
  Body,
  Controller,
  NotFoundException,
  Post,
  UseGuards,
} from "@nestjs/common";
import { startSessionSchema } from "@danisolation-recall/contracts";
import { createZodDto } from "nestjs-zod";
import { AuthGuard, CurrentUser } from "../auth/auth.guard";
import { type User } from "../auth/users.repository";
import { type StartSessionResult, StartSessionService } from "./start-session.service";

export class StartSessionDto extends createZodDto(startSessionSchema) {}

@Controller("study-sessions")
export class SessionsController {
  constructor(private readonly startSessionService: StartSessionService) {}

  @Post()
  @UseGuards(AuthGuard)
  async start(
    @CurrentUser() user: User,
    @Body() body: StartSessionDto,
  ): Promise<StartSessionResult> {
    const result = await this.startSessionService.start(user.id, body);

    if (!result) {
      throw new NotFoundException({
        code: "SET_NOT_FOUND",
        message: "Study set not found",
      });
    }

    return result;
  }
}

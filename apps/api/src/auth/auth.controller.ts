import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Post,
} from "@nestjs/common";
import { z } from "zod";
import { registerSchema } from "./register.schema";
import {
  EmailAlreadyRegisteredError,
  RegisterService,
  type RegisteredUser,
} from "./register.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly registerService: RegisterService) {}

  @Post("register")
  async register(@Body() body: unknown): Promise<RegisteredUser> {
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      throw new BadRequestException({
        code: "VALIDATION_ERROR",
        errors: z.flattenError(parsed.error),
      });
    }

    try {
      return await this.registerService.register(parsed.data);
    } catch (error) {
      if (error instanceof EmailAlreadyRegisteredError) {
        throw new ConflictException({
          code: error.code,
          message: error.message,
        });
      }
      throw error;
    }
  }
}

import { Body, ConflictException, Controller, Post } from "@nestjs/common";
import { registerSchema } from "@danisolation-recall/contracts";
import { createZodDto } from "nestjs-zod";
import {
  EmailAlreadyRegisteredError,
  RegisterService,
  type RegisteredUser,
} from "./register.service";

export class RegisterDto extends createZodDto(registerSchema) {}

@Controller("auth")
export class AuthController {
  constructor(private readonly registerService: RegisterService) {}

  @Post("register")
  async register(@Body() body: RegisterDto): Promise<RegisteredUser> {
    try {
      return await this.registerService.register(body);
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

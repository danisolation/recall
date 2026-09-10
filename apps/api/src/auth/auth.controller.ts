import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
  UnauthorizedException,
} from "@nestjs/common";
import { loginSchema, registerSchema } from "@danisolation-recall/contracts";
import { createZodDto } from "nestjs-zod";
import {
  EmailAlreadyRegisteredError,
  RegisterService,
  type RegisteredUser,
} from "./register.service";
import {
  InvalidCredentialsError,
  LoginService,
  type AuthenticatedUser,
} from "./login.service";

export class RegisterDto extends createZodDto(registerSchema) {}

export class LoginDto extends createZodDto(loginSchema) {}

@Controller("auth")
export class AuthController {
  constructor(
    private readonly registerService: RegisterService,
    private readonly loginService: LoginService,
  ) {}

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

  @Post("login")
  @HttpCode(200)
  async login(@Body() body: LoginDto): Promise<AuthenticatedUser> {
    try {
      return await this.loginService.login(body);
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        throw new UnauthorizedException({
          code: error.code,
          message: error.message,
        });
      }
      throw error;
    }
  }
}

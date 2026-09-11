import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
  Res,
  UnauthorizedException,
} from "@nestjs/common";
import type { Response } from "express";
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
import { SESSION_COOKIE_NAME, SessionService } from "./session";

export class RegisterDto extends createZodDto(registerSchema) {}

export class LoginDto extends createZodDto(loginSchema) {}

@Controller("auth")
export class AuthController {
  constructor(
    private readonly registerService: RegisterService,
    private readonly loginService: LoginService,
    private readonly sessionService: SessionService,
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
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthenticatedUser> {
    try {
      const user = await this.loginService.login(body);
      const session = await this.sessionService.issue(user.id);
      response.cookie(SESSION_COOKIE_NAME, session.token, {
        httpOnly: true,
        sameSite: "lax",
        expires: session.expiresAt,
        secure: process.env.NODE_ENV === "production",
      });
      return user;
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

import {
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import type { Request, Response } from "express";
import { loginSchema, registerSchema } from "@danisolation-recall/contracts";
import { createZodDto } from "nestjs-zod";
import { AuthGuard, CurrentUser } from "./auth.guard";
import { RateLimitGuard } from "./rate-limit.guard";
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
import { type User } from "./users.repository";

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

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @UseGuards(RateLimitGuard)
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

  @Get("me")
  @UseGuards(AuthGuard)
  me(@CurrentUser() user: User): AuthenticatedUser {
    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  @Post("logout")
  @UseGuards(AuthGuard)
  @HttpCode(204)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const token = request.cookies?.[SESSION_COOKIE_NAME];

    if (token) {
      await this.sessionService.revoke(token);
    }

    response.clearCookie(SESSION_COOKIE_NAME);
  }
}

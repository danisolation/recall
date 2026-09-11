import { ConflictException, UnauthorizedException } from "@nestjs/common";
import type { Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { AuthController } from "./auth.controller";
import {
  EmailAlreadyRegisteredError,
  type RegisterService,
  type RegisteredUser,
} from "./register.service";
import {
  InvalidCredentialsError,
  type AuthenticatedUser,
  type LoginService,
} from "./login.service";
import { SESSION_COOKIE_NAME, type SessionService } from "./session";

const email = "auth.controller@example.com";
const password = "correct horse battery staple";

function createRegisterServiceMock() {
  return { register: vi.fn() } as unknown as RegisterService;
}

function createLoginServiceMock() {
  return { login: vi.fn() } as unknown as LoginService;
}

function createSessionServiceMock() {
  return { issue: vi.fn() } as unknown as SessionService;
}

function createResponseMock() {
  return { cookie: vi.fn() } as unknown as Response;
}

describe("AuthController", () => {
  it("registers a user with valid input", async () => {
    const registerService = createRegisterServiceMock();
    const registered: RegisteredUser = {
      id: 1,
      email,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(registerService.register).mockResolvedValue(registered);

    const controller = new AuthController(
      registerService,
      createLoginServiceMock(),
      createSessionServiceMock(),
    );
    const result = await controller.register({ email, password });

    expect(result).toBe(registered);
    expect(registerService.register).toHaveBeenCalledWith({ email, password });
  });

  it("maps a duplicate email to a conflict error", async () => {
    const registerService = createRegisterServiceMock();
    vi.mocked(registerService.register).mockRejectedValue(
      new EmailAlreadyRegisteredError(email),
    );

    const controller = new AuthController(
      registerService,
      createLoginServiceMock(),
      createSessionServiceMock(),
    );

    await expect(
      controller.register({ email, password }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("logs a user in and issues a session cookie", async () => {
    const loginService = createLoginServiceMock();
    const authenticated: AuthenticatedUser = {
      id: 1,
      email,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(loginService.login).mockResolvedValue(authenticated);

    const sessionService = createSessionServiceMock();
    const expiresAt = new Date();
    vi.mocked(sessionService.issue).mockResolvedValue({
      token: "issued-token",
      expiresAt,
    });

    const response = createResponseMock();
    const controller = new AuthController(
      createRegisterServiceMock(),
      loginService,
      sessionService,
    );
    const result = await controller.login({ email, password }, response);

    expect(result).toBe(authenticated);
    expect(sessionService.issue).toHaveBeenCalledWith(authenticated.id);
    expect(response.cookie).toHaveBeenCalledWith(
      SESSION_COOKIE_NAME,
      "issued-token",
      expect.objectContaining({
        httpOnly: true,
        sameSite: "lax",
        expires: expiresAt,
      }),
    );
  });

  it("maps invalid credentials to an unauthorized error and sets no cookie", async () => {
    const loginService = createLoginServiceMock();
    vi.mocked(loginService.login).mockRejectedValue(
      new InvalidCredentialsError(),
    );

    const response = createResponseMock();
    const controller = new AuthController(
      createRegisterServiceMock(),
      loginService,
      createSessionServiceMock(),
    );

    await expect(
      controller.login({ email, password }, response),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(response.cookie).not.toHaveBeenCalled();
  });
});

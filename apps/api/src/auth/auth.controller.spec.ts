import { ConflictException, UnauthorizedException } from "@nestjs/common";
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

const email = "auth.controller@example.com";
const password = "correct horse battery staple";

function createRegisterServiceMock() {
  return { register: vi.fn() } as unknown as RegisterService;
}

function createLoginServiceMock() {
  return { login: vi.fn() } as unknown as LoginService;
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
    );

    await expect(
      controller.register({ email, password }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("logs a user in with valid credentials", async () => {
    const loginService = createLoginServiceMock();
    const authenticated: AuthenticatedUser = {
      id: 1,
      email,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(loginService.login).mockResolvedValue(authenticated);

    const controller = new AuthController(
      createRegisterServiceMock(),
      loginService,
    );
    const result = await controller.login({ email, password });

    expect(result).toBe(authenticated);
    expect(loginService.login).toHaveBeenCalledWith({ email, password });
  });

  it("maps invalid credentials to an unauthorized error", async () => {
    const loginService = createLoginServiceMock();
    vi.mocked(loginService.login).mockRejectedValue(
      new InvalidCredentialsError(),
    );

    const controller = new AuthController(
      createRegisterServiceMock(),
      loginService,
    );

    await expect(
      controller.login({ email, password }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});

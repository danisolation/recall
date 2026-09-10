import { ConflictException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import { AuthController } from "./auth.controller";
import {
  EmailAlreadyRegisteredError,
  type RegisterService,
  type RegisteredUser,
} from "./register.service";

const email = "auth.controller@example.com";
const password = "correct horse battery staple";

function createRegisterServiceMock() {
  return { register: vi.fn() } as unknown as RegisterService;
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

    const controller = new AuthController(registerService);
    const result = await controller.register({ email, password });

    expect(result).toBe(registered);
    expect(registerService.register).toHaveBeenCalledWith({ email, password });
  });

  it("maps a duplicate email to a conflict error", async () => {
    const registerService = createRegisterServiceMock();
    vi.mocked(registerService.register).mockRejectedValue(
      new EmailAlreadyRegisteredError(email),
    );

    const controller = new AuthController(registerService);

    await expect(
      controller.register({ email, password }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});

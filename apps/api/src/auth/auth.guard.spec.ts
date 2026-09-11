import { UnauthorizedException, type ExecutionContext } from "@nestjs/common";
import type { Request } from "express";
import { describe, expect, it, vi } from "vitest";
import { AuthGuard } from "./auth.guard";
import { SESSION_COOKIE_NAME, type SessionService } from "./session";
import type { User } from "./users.repository";

const email = "auth.guard@example.com";

function createUser(overrides: Partial<User> = {}): User {
  return {
    id: 1,
    email,
    passwordHash: "hashed",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function createContext(request: Partial<Request>): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

function createSessionServiceMock() {
  return { findUserByToken: vi.fn() } as unknown as SessionService;
}

describe("AuthGuard", () => {
  it("rejects a request without a session cookie", async () => {
    const guard = new AuthGuard(createSessionServiceMock());

    await expect(
      guard.canActivate(createContext({ cookies: {} })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("rejects a request with an unknown session token", async () => {
    const sessionService = createSessionServiceMock();
    vi.mocked(sessionService.findUserByToken).mockResolvedValue(null);
    const guard = new AuthGuard(sessionService);

    await expect(
      guard.canActivate(
        createContext({ cookies: { [SESSION_COOKIE_NAME]: "bad-token" } }),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("populates the current user for a valid session", async () => {
    const sessionService = createSessionServiceMock();
    const user = createUser();
    vi.mocked(sessionService.findUserByToken).mockResolvedValue(user);
    const guard = new AuthGuard(sessionService);

    const request: Partial<Request> = {
      cookies: { [SESSION_COOKIE_NAME]: "valid-token" },
    };

    await expect(guard.canActivate(createContext(request))).resolves.toBe(
      true,
    );
    expect(request.currentUser).toBe(user);
  });
});

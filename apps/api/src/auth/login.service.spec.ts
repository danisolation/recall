import { describe, expect, it, vi } from "vitest";
import { hashPassword } from "./password";
import { InvalidCredentialsError, LoginService } from "./login.service";
import type { User, UsersRepository } from "./users.repository";

const email = "login.service@example.com";
const password = "correct horse battery staple";

function createUser(overrides: Partial<User> = {}): User {
  return {
    id: 1,
    email,
    passwordHash: "existing-hash",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function createUsersRepositoryMock() {
  return {
    create: vi.fn(),
    findByEmail: vi.fn(),
    findById: vi.fn(),
  } as unknown as UsersRepository;
}

describe("LoginService", () => {
  it("returns the user for valid credentials", async () => {
    const usersRepository = createUsersRepositoryMock();
    const passwordHash = await hashPassword(password);
    vi.mocked(usersRepository.findByEmail).mockResolvedValue(
      createUser({ passwordHash }),
    );

    const service = new LoginService(usersRepository);
    const result = await service.login({ email, password });

    expect(result.id).toBe(1);
    expect(result.email).toBe(email);
    expect("passwordHash" in result).toBe(false);
    expect(usersRepository.findByEmail).toHaveBeenCalledWith(email);
  });

  it("rejects an unknown email", async () => {
    const usersRepository = createUsersRepositoryMock();
    vi.mocked(usersRepository.findByEmail).mockResolvedValue(null);

    const service = new LoginService(usersRepository);

    await expect(
      service.login({ email, password }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it("rejects a wrong password", async () => {
    const usersRepository = createUsersRepositoryMock();
    const passwordHash = await hashPassword("a different password");
    vi.mocked(usersRepository.findByEmail).mockResolvedValue(
      createUser({ passwordHash }),
    );

    const service = new LoginService(usersRepository);

    await expect(
      service.login({ email, password }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it("rejects a user without a stored password hash", async () => {
    const usersRepository = createUsersRepositoryMock();
    vi.mocked(usersRepository.findByEmail).mockResolvedValue(
      createUser({ passwordHash: null }),
    );

    const service = new LoginService(usersRepository);

    await expect(
      service.login({ email, password }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });
});

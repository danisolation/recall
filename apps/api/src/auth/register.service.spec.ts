import { describe, expect, it, vi } from "vitest";
import { verifyPassword } from "./password";
import {
  EmailAlreadyRegisteredError,
  RegisterService,
} from "./register.service";
import type { UsersRepository } from "./users.repository";

const email = "register.service@example.com";
const password = "correct horse battery staple";

function createUsersRepositoryMock() {
  return {
    create: vi.fn(),
    findByEmail: vi.fn(),
    findById: vi.fn(),
  } as unknown as UsersRepository;
}

describe("RegisterService", () => {
  it("creates a user with a hashed password", async () => {
    const usersRepository = createUsersRepositoryMock();
    vi.mocked(usersRepository.findByEmail).mockResolvedValue(null);

    let storedPasswordHash = "";
    vi.mocked(usersRepository.create).mockImplementation(async (values) => {
      storedPasswordHash = values.passwordHash ?? "";
      return {
        id: 1,
        email: values.email,
        passwordHash: values.passwordHash ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    const service = new RegisterService(usersRepository);
    const result = await service.register({ email, password });

    expect(result.email).toBe(email);
    expect("passwordHash" in result).toBe(false);

    expect(storedPasswordHash).toMatch(/^\$argon2id\$/);
    expect(storedPasswordHash).not.toContain(password);
    await expect(verifyPassword(storedPasswordHash, password)).resolves.toBe(
      true,
    );
  });

  it("rejects a duplicate email", async () => {
    const usersRepository = createUsersRepositoryMock();
    vi.mocked(usersRepository.findByEmail).mockResolvedValue({
      id: 1,
      email,
      passwordHash: "existing-hash",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const service = new RegisterService(usersRepository);

    await expect(
      service.register({ email, password }),
    ).rejects.toBeInstanceOf(EmailAlreadyRegisteredError);
    expect(usersRepository.create).not.toHaveBeenCalled();
  });
});

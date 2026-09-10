import { Injectable } from "@nestjs/common";
import { type LoginInput } from "@danisolation-recall/contracts";
import { verifyPassword } from "./password";
import { type User, UsersRepository } from "./users.repository";

export class InvalidCredentialsError extends Error {
  readonly code = "INVALID_CREDENTIALS";

  constructor() {
    super("Invalid email or password");
    this.name = "InvalidCredentialsError";
  }
}

export type AuthenticatedUser = Omit<User, "passwordHash">;

@Injectable()
export class LoginService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async login(input: LoginInput): Promise<AuthenticatedUser> {
    const user = await this.usersRepository.findByEmail(input.email);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    const valid = await verifyPassword(user.passwordHash ?? "", input.password);

    if (!valid) {
      throw new InvalidCredentialsError();
    }

    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

import { Injectable } from "@nestjs/common";
import { type RegisterInput } from "@danisolation-recall/contracts";
import { hashPassword } from "./password";
import { type User, UsersRepository } from "./users.repository";

export class EmailAlreadyRegisteredError extends Error {
  readonly code = "EMAIL_ALREADY_REGISTERED";

  constructor(email: string) {
    super(`Email ${email} is already registered`);
    this.name = "EmailAlreadyRegisteredError";
  }
}

export type RegisteredUser = Omit<User, "passwordHash">;

@Injectable()
export class RegisterService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async register(input: RegisterInput): Promise<RegisteredUser> {
    const existing = await this.usersRepository.findByEmail(input.email);

    if (existing) {
      throw new EmailAlreadyRegisteredError(input.email);
    }

    const passwordHash = await hashPassword(input.password);
    const user = await this.usersRepository.create({
      email: input.email,
      passwordHash,
    });

    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

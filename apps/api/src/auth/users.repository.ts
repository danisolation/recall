import { Inject, Injectable } from "@nestjs/common";
import { eq, users } from "@danisolation-recall/database";
import { DATABASE_PROVIDER, type Database } from "../database/database.module";

type NewUser = typeof users.$inferInsert;
type User = typeof users.$inferSelect;

@Injectable()
export class UsersRepository {
  constructor(@Inject(DATABASE_PROVIDER) private readonly db: Database) {}

  async create(values: NewUser): Promise<User> {
    const [user] = await this.db.insert(users).values(values).returning();

    if (!user) {
      throw new Error("Failed to create user");
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return user ?? null;
  }

  async findById(id: number): Promise<User | null> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return user ?? null;
  }
}

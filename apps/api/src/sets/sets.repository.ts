import { Inject, Injectable } from "@nestjs/common";
import {
  and,
  desc,
  eq,
  studySets,
} from "@danisolation-recall/database";
import type { CreateSetInput, UpdateSetInput } from "@danisolation-recall/contracts";
import { DATABASE_PROVIDER, type Database } from "../database/database.module";

export type StudySet = typeof studySets.$inferSelect;

@Injectable()
export class SetsRepository {
  constructor(@Inject(DATABASE_PROVIDER) private readonly db: Database) {}

  async create(ownerId: number, input: CreateSetInput): Promise<StudySet> {
    const [set] = await this.db
      .insert(studySets)
      .values({
        ownerId,
        title: input.title,
        description: input.description ?? null,
      })
      .returning();

    if (!set) {
      throw new Error("Failed to create study set");
    }

    return set;
  }

  async findById(id: number, ownerId: number): Promise<StudySet | null> {
    const [set] = await this.db
      .select()
      .from(studySets)
      .where(and(eq(studySets.id, id), eq(studySets.ownerId, ownerId)))
      .limit(1);

    return set ?? null;
  }

  async listByOwner(
    ownerId: number,
    page: { limit: number; offset: number },
  ): Promise<StudySet[]> {
    return this.db
      .select()
      .from(studySets)
      .where(eq(studySets.ownerId, ownerId))
      .orderBy(desc(studySets.createdAt), desc(studySets.id))
      .limit(page.limit)
      .offset(page.offset);
  }

  async update(
    id: number,
    ownerId: number,
    input: UpdateSetInput,
  ): Promise<StudySet | null> {
    const values: Partial<typeof studySets.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (input.title !== undefined) {
      values.title = input.title;
    }

    if (input.description !== undefined) {
      values.description = input.description;
    }

    const [set] = await this.db
      .update(studySets)
      .set(values)
      .where(and(eq(studySets.id, id), eq(studySets.ownerId, ownerId)))
      .returning();

    return set ?? null;
  }

  async delete(id: number, ownerId: number): Promise<boolean> {
    const deleted = await this.db
      .delete(studySets)
      .where(and(eq(studySets.id, id), eq(studySets.ownerId, ownerId)))
      .returning({ id: studySets.id });

    return deleted.length > 0;
  }
}

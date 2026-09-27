import { Inject, Injectable } from "@nestjs/common";
import {
  and,
  desc,
  eq,
  ilike,
  or,
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

  // ADR-011: an optional free-text filter over the caller's own sets.
  // Ownership stays in this WHERE clause (§41) — a foreign set is never
  // searchable. An empty q (the schema trims) means no filter, and and()
  // ignores the undefined branch, so the search composes cleanly.
  async listByOwner(
    ownerId: number,
    page: { limit: number; offset: number },
    q?: string,
  ): Promise<StudySet[]> {
    // Escape the LIKE metacharacters so a user's % or _ matches literally,
    // then wrap the whole query in wildcards.
    const pattern = q ? `%${q.replace(/[\\%_]/g, "\\$&")}%` : undefined;

    return this.db
      .select()
      .from(studySets)
      .where(
        and(
          eq(studySets.ownerId, ownerId),
          pattern
            ? or(
                ilike(studySets.title, pattern),
                ilike(studySets.description, pattern),
              )
            : undefined,
        ),
      )
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

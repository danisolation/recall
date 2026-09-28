import { Inject, Injectable } from "@nestjs/common";
import {
  and,
  asc,
  desc,
  eq,
  ilike,
  inArray,
  or,
  cards,
  setTags,
  studySets,
  tags,
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

  // ADR-015: the public read behind the unauthenticated endpoint — the
  // app's one deliberate exception to §41. A set is returned only when its
  // visibility is `public`; private, foreign, and missing all fold into the
  // same null, which the controller turns into 404 SET_NOT_FOUND. Cards
  // come in study order (position, then id — the cards repository's own
  // ordering), tags alphabetical.
  async findPublicById(id: number): Promise<{
    set: StudySet;
    cards: (typeof cards.$inferSelect)[];
    tags: (typeof tags.$inferSelect)[];
  } | null> {
    const [set] = await this.db
      .select()
      .from(studySets)
      .where(and(eq(studySets.id, id), eq(studySets.visibility, "public")))
      .limit(1);

    if (!set) {
      return null;
    }

    const cardRows = await this.db
      .select()
      .from(cards)
      .where(eq(cards.setId, id))
      .orderBy(asc(cards.position), asc(cards.id));

    const tagRows = await this.db
      .select({ tag: tags })
      .from(setTags)
      .innerJoin(tags, eq(setTags.tagId, tags.id))
      .where(eq(setTags.setId, id))
      .orderBy(asc(tags.name));

    return {
      set,
      cards: cardRows,
      tags: tagRows.map((row) => row.tag),
    };
  }

  // ADR-011 + ADR-012: an optional free-text filter and an optional tag
  // filter over the caller's own sets. Ownership stays in this WHERE clause
  // (§41) — a foreign set is never searchable, and a foreign tag id yields
  // an empty page because the tag subquery requires the tag to be the
  // caller's. An empty q (the schema trims) and an absent tag mean no
  // filter, and and() ignores the undefined branches.
  async listByOwner(
    ownerId: number,
    page: { limit: number; offset: number },
    q?: string,
    tagId?: number,
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
          // A semijoin instead of a join in the outer query: conditional
          // INNER JOINs would either duplicate multi-tagged sets or vanish
          // untagged ones.
          tagId !== undefined
            ? inArray(
                studySets.id,
                this.db
                  .select({ id: setTags.setId })
                  .from(setTags)
                  .innerJoin(tags, eq(setTags.tagId, tags.id))
                  .where(
                    and(
                      eq(setTags.tagId, tagId),
                      eq(tags.userId, ownerId),
                    ),
                  ),
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

    // ADR-015: the visibility token — validated by the contract's enum, so
    // only `private` | `public` can reach this branch.
    if (input.visibility !== undefined) {
      values.visibility = input.visibility;
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

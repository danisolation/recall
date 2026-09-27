import { Inject, Injectable } from "@nestjs/common";
import {
  and,
  asc,
  eq,
  inArray,
  sql,
  setTags,
  studySets,
  tags,
} from "@danisolation-recall/database";
import { DATABASE_PROVIDER, type Database } from "../database/database.module";

export type Tag = typeof tags.$inferSelect;

export type ReplaceTagsResult =
  | { outcome: "replaced"; tags: Tag[] }
  | { outcome: "notFound" };

@Injectable()
export class TagsRepository {
  constructor(@Inject(DATABASE_PROVIDER) private readonly db: Database) {}

  // ADR-012: the caller's tags, alphabetical — the filter UI's vocabulary.
  async listByUser(userId: number): Promise<Tag[]> {
    return this.db
      .select()
      .from(tags)
      .where(eq(tags.userId, userId))
      .orderBy(asc(tags.name));
  }

  // The tags of one set; a foreign or unknown set is indistinguishable
  // from missing (§41) — the endpoint folds null into 404 SET_NOT_FOUND.
  async listBySet(setId: number, userId: number): Promise<Tag[] | null> {
    const [set] = await this.db
      .select({ id: studySets.id })
      .from(studySets)
      .where(and(eq(studySets.id, setId), eq(studySets.ownerId, userId)))
      .limit(1);

    if (!set) {
      return null;
    }

    const rows = await this.db
      .select({ tag: tags })
      .from(setTags)
      .innerJoin(tags, eq(setTags.tagId, tags.id))
      .where(eq(setTags.setId, setId))
      .orderBy(asc(tags.name));

    return rows.map((row) => row.tag);
  }

  // ADR-012's replace contract: the given names become exactly the set's
  // tags. Everything happens in one transaction (§34) — a half-applied
  // labeling must be impossible. Create-or-get is batched (one select, one
  // insert, one re-select) rather than per-name, so N names cost a fixed
  // number of statements (§35); a per-name variant would be dead code until
  // an endpoint needs it (§107).
  async replace(
    setId: number,
    ownerId: number,
    names: string[],
  ): Promise<ReplaceTagsResult> {
    // Trim, drop empties, and dedupe case-insensitively — the first casing
    // typed wins display. The endpoint's schema validates the 1–50 length
    // and the 10-tag ceiling; the repository normalizes because it is the
    // only writer and owns the invariant.
    const normalized = [
      ...new Map(
        names
          .map((name) => name.trim())
          .filter((name) => name.length > 0)
          .map((name) => [name.toLowerCase(), name] as const),
      ).values(),
    ];
    const lowered = normalized.map((name) => name.toLowerCase());

    return this.db.transaction(async (tx) => {
      const [set] = await tx
        .select({ id: studySets.id })
        .from(studySets)
        .where(and(eq(studySets.id, setId), eq(studySets.ownerId, ownerId)))
        .limit(1);

      if (!set) {
        return { outcome: "notFound" as const };
      }

      if (normalized.length > 0) {
        const existing = await tx
          .select({ id: tags.id, name: tags.name })
          .from(tags)
          .where(
            and(
              eq(tags.userId, ownerId),
              inArray(sql`lower(${tags.name})`, lowered),
            ),
          );

        const known = new Set(
          existing.map((tag) => tag.name.toLowerCase()),
        );
        const missing = normalized.filter(
          (name) => !known.has(name.toLowerCase()),
        );

        if (missing.length > 0) {
          // The expression unique index (ORG-002) makes a raced duplicate
          // insert a no-op instead of an error.
          await tx
            .insert(tags)
            .values(missing.map((name) => ({ userId: ownerId, name })))
            .onConflictDoNothing();
        }
      }

      // Re-select whatever exists now (also covers a raced insert), then
      // make the set's join rows match exactly.
      const target = normalized.length
        ? await tx
            .select()
            .from(tags)
            .where(
              and(
                eq(tags.userId, ownerId),
                inArray(sql`lower(${tags.name})`, lowered),
              ),
            )
        : [];

      await tx.delete(setTags).where(eq(setTags.setId, setId));

      if (target.length > 0) {
        await tx
          .insert(setTags)
          .values(target.map((tag) => ({ setId, tagId: tag.id })));
      }

      const ordered = [...target].sort((a, b) =>
        a.name.localeCompare(b.name),
      );

      return { outcome: "replaced" as const, tags: ordered };
    });
  }
}

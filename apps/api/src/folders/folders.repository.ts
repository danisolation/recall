import { Inject, Injectable } from "@nestjs/common";
import {
  and,
  asc,
  count,
  eq,
  folders,
  studySets,
} from "@danisolation-recall/database";
import { DATABASE_PROVIDER, type Database } from "../database/database.module";

export type Folder = typeof folders.$inferSelect;

export type FolderWithCount = Folder & { setCount: number };

export type RenameFolderResult =
  | { outcome: "renamed"; folder: Folder }
  | { outcome: "notFound" }
  | { outcome: "conflict" };

// The unique-violation SQLSTATE. The expression index
// (folders_user_id_lower_name_unique) is the race-proof source of truth for
// duplicate names, so violations are translated into outcomes instead of
// being pre-checked — a pre-check would race.
const UNIQUE_VIOLATION = "23505";

function isUniqueViolation(error: unknown): boolean {
  // Drizzle wraps driver errors (DrizzleQueryError.cause → pg error), so
  // walk the cause chain for the SQLSTATE.
  let current: unknown = error;
  while (typeof current === "object" && current !== null) {
    if ((current as { code?: unknown }).code === UNIQUE_VIOLATION) {
      return true;
    }
    current = (current as { cause?: unknown }).cause;
  }
  return false;
}

@Injectable()
export class FoldersRepository {
  constructor(@Inject(DATABASE_PROVIDER) private readonly db: Database) {}

  // ADR-014: the caller's folders with their set counts, alphabetical —
  // the dashboard's folder navigation. One GROUP BY; the counts ride the
  // list because a folder list without counts cannot answer "where is my
  // stuff" (the ADR's reason for breaking symmetry with the deferred tag
  // counts).
  async listByUser(userId: number): Promise<FolderWithCount[]> {
    const rows = await this.db
      .select({ folder: folders, setCount: count(studySets.id) })
      .from(folders)
      .leftJoin(studySets, eq(studySets.folderId, folders.id))
      .where(eq(folders.userId, userId))
      .groupBy(folders.id)
      .orderBy(asc(folders.name));

    return rows.map((row) => ({ ...row.folder, setCount: row.setCount }));
  }

  async create(userId: number, name: string): Promise<Folder | "conflict"> {
    try {
      const [folder] = await this.db
        .insert(folders)
        .values({ userId, name })
        .returning();

      return folder!;
    } catch (error) {
      if (isUniqueViolation(error)) {
        return "conflict";
      }
      throw error;
    }
  }

  // Rename carries the caller's ownership in the WHERE (§41) — a foreign
  // folder is indistinguishable from a missing one, and both fold into
  // notFound. The unique index turns a raced duplicate into the conflict
  // outcome.
  async rename(
    folderId: number,
    userId: number,
    name: string,
  ): Promise<RenameFolderResult> {
    try {
      const [folder] = await this.db
        .update(folders)
        .set({ name, updatedAt: new Date() })
        .where(and(eq(folders.id, folderId), eq(folders.userId, userId)))
        .returning();

      if (!folder) {
        return { outcome: "notFound" };
      }

      return { outcome: "renamed", folder };
    } catch (error) {
      if (isUniqueViolation(error)) {
        return { outcome: "conflict" };
      }
      throw error;
    }
  }

  // Deleting a folder never touches sets: study_sets.folder_id is
  // ON DELETE SET NULL (FOLD-002), so filed sets fall back to the library
  // root. The schema owns the content-safety; the repository adds nothing.
  async remove(folderId: number, userId: number): Promise<boolean> {
    const rows = await this.db
      .delete(folders)
      .where(and(eq(folders.id, folderId), eq(folders.userId, userId)))
      .returning({ id: folders.id });

    return rows.length > 0;
  }

  // The placement check the set writes call (FOLD-004): a folderId is
  // assignable iff it is one of the caller's folders — a foreign folder
  // folds into "not owned" and the endpoint rejects the write (§41).
  async isOwnedBy(folderId: number, userId: number): Promise<boolean> {
    const rows = await this.db
      .select({ id: folders.id })
      .from(folders)
      .where(and(eq(folders.id, folderId), eq(folders.userId, userId)))
      .limit(1);

    return rows.length > 0;
  }
}

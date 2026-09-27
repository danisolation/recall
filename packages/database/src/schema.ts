import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  unique,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const studySets = pgTable(
  "study_sets",
  {
    id: serial("id").primaryKey(),
    ownerId: integer("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // ADR-014: single-parent containment — a set is filed in at most one
    // folder, and deleting the folder unfiles its sets instead of deleting
    // them (the organizer is disposable; the content is not).
    folderId: integer("folder_id").references(() => folders.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("study_sets_owner_id_index").on(table.ownerId),
    index("study_sets_folder_id_index").on(table.folderId),
  ],
);

// `position` carries the study order within a set. It is a plain index, not a
// unique constraint: reordering shifts several rows at once, which a unique
// index would reject mid-transaction. Ordering integrity is owned by the
// repository — the only writer (CARD-001 decision).
export const cards = pgTable(
  "cards",
  {
    id: serial("id").primaryKey(),
    setId: integer("set_id")
      .notNull()
      .references(() => studySets.id, { onDelete: "cascade" }),
    front: text("front").notNull(),
    back: text("back").notNull(),
    position: integer("position").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("cards_set_id_index").on(table.setId)],
);

// ADR-009: a study session is one ordered pass over a set's cards. `status`
// holds the state machine's tokens (ACTIVE, COMPLETED, ABANDONED) as plain
// text; the transitions are owned by the study repository, the only writer,
// like the cards table's position invariant.
export const studySessions = pgTable(
  "study_sessions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    setId: integer("set_id")
      .notNull()
      .references(() => studySets.id, { onDelete: "cascade" }),
    status: text("status").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("study_sessions_user_id_index").on(table.userId)],
);

// ADR-009: a review is a historical event — inserted once, never updated
// (§46). One review per card per session; the unique constraint makes that
// rule race-proof, and the study repository translates a violation into
// 409 REVIEW_ALREADY_RECORDED.
export const reviews = pgTable(
  "reviews",
  {
    id: serial("id").primaryKey(),
    sessionId: integer("session_id")
      .notNull()
      .references(() => studySessions.id, { onDelete: "cascade" }),
    cardId: integer("card_id")
      .notNull()
      .references(() => cards.id, { onDelete: "cascade" }),
    correct: boolean("correct").notNull(),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("reviews_session_id_index").on(table.sessionId),
    index("reviews_card_id_index").on(table.cardId),
    unique("reviews_session_id_card_id_unique").on(
      table.sessionId,
      table.cardId,
    ),
  ],
);

// ADR-009 / §45: a card's current learning state for one user — distinct
// from the reviews table's history (§46). `streak` (consecutive correct
// answers) is the scheduling state the study module's ladder reads, and
// `next_review_at` is what it produces. One row per user per card, enforced
// by the unique constraint the review endpoint's upsert relies on.
export const userCardProgress = pgTable(
  "user_card_progress",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    cardId: integer("card_id")
      .notNull()
      .references(() => cards.id, { onDelete: "cascade" }),
    reviewCount: integer("review_count").notNull().default(0),
    correctCount: integer("correct_count").notNull().default(0),
    streak: integer("streak").notNull().default(0),
    lastReviewedAt: timestamp("last_reviewed_at", { withTimezone: true }),
    nextReviewAt: timestamp("next_review_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("user_card_progress_user_id_card_id_unique").on(
      table.userId,
      table.cardId,
    ),
  ],
);

// ADR-012: a tag is the user's own label — names are unique per user
// case-insensitively (the expression index folds the name to lower case for
// the check while the column keeps the display casing). No tag delete/rename
// exists in MVP; tags cascade with their owner and never touch sets.
export const tags = pgTable(
  "tags",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("tags_user_id_lower_name_unique").on(
      table.userId,
      sql`lower(${table.name})`,
    ),
  ],
);

// ADR-012: the many-to-many join between sets and the owner's tags. The
// pair is the row's identity (composite primary key = the ADR's unique
// constraint), and the tag_id index covers "everything labeled X" lookups.
// Ownership flows through both parents — a tag must belong to the set's
// owner to be assignable, which the tags repository enforces (§41).
export const setTags = pgTable(
  "set_tags",
  {
    setId: integer("set_id")
      .notNull()
      .references(() => studySets.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.setId, table.tagId] }),
    index("set_tags_tag_id_index").on(table.tagId),
  ],
);

// ADR-014: a folder is a shelf the user files sets into — single-parent
// containment, not a second labeling system (that's tags). Names follow the
// tags discipline: unique per user case-insensitively via the expression
// index, display casing preserved. Deleting a folder sets its sets'
// folder_id to null (the column's ON DELETE), never touching content.
export const folders = pgTable(
  "folders",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("folders_user_id_index").on(table.userId),
    uniqueIndex("folders_user_id_lower_name_unique").on(
      table.userId,
      sql`lower(${table.name})`,
    ),
  ],
);

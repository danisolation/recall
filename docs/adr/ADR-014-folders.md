# ADR-014: Folders — containment over the labeling layer

## Context

Phase 2 opens. `docs/ROADMAP.md` planned "tags/folders (whichever was not chosen in MVP)" — ADR-012 chose tags for the MVP, and §80 deferred folders with a recorded promise: they arrive **on top of the labeling layer as containment** ("file a set into a folder"), not as a second labeling system. The library currently answers three finding questions — text search (`?q=`, ADR-011) and label filtering (`?tag=`, ADR-012) over one list — but nothing answers "browse by where I filed it", and a growing collection needs that shelf metaphor the way files need directories. Constraints inherited from the house rules: deleting an organizer must never delete sets (ADR-009's cascade philosophy stops at content), ownership lives in SQL (§41), filters live in the URL (§23), validation is strict (§53), and the phase must be one honest slice.

## Decision

- **Single-parent containment.** A set lives in **at most one folder**: a `folders` table (id, user_id FK cascade, name, timestamps) plus a nullable `study_sets.folder_id` FK. Deliberately **not** a join table — a many-to-many membership would be a second tagging system competing with ADR-012's, and it would make "where does this set live?" ambiguous. Folderless sets are the library root; every set is always reachable under "All sets".
- **Names per user, case-insensitively unique** — expression unique index on `(user_id, lower(name))`, 1–50 characters after trimming. The exact naming discipline tags already established (§53); first-created casing wins display.
- **Deleting a folder never touches sets.** `study_sets.folder_id` is `ON DELETE SET NULL`: filed sets fall back to the root, unfiled but intact. The organizer is disposable; the content is not.
- **API**: `GET /folders` returns the caller's folders **with per-folder set counts** (one GROUP BY) — counts are navigationally essential for a folder list in a way the deferred tag counts were not; `POST /folders { name }`; `PATCH /folders/:id { name }` (rename); `DELETE /folders/:id`. Foreign or missing folders fold into 404 `FOLDER_NOT_FOUND`. Set placement rides the set contracts: `POST /sets` and `PATCH /sets/:id` gain an optional validated `folderId` (null = unfile) — one assignment path on the surfaces that already edit sets, and no dedicated move endpoint.
- **Dashboard**: `?folder=<id>` joins `?q=` and `?tag=` as the third URL-state filter — the three compose (all AND), because "the Biology folder, containing exam material, matching 'cell'" is one question with three parts. Folder links render with their counts. A dedicated `/forms`-style page — `/folders` — handles create/rename/delete, linked from the dashboard.
- **Forms**: the set create/edit forms gain a folder select (the caller's folders + "No folder").

## Alternatives

- **Many-to-many membership (join table)** — symmetric with tags and more flexible; rejected because it duplicates the labeling model ADR-012 already owns, and containment is the actual mental model: a folder is a shelf, not a label.
- **Nested folders (`parent_id`)** — real directories for deep collections; rejected: tree navigation, move semantics, and cycle handling are not one slice. Flat folders are what §80's deferral described; a `parent_id` later is additive.
- **A dedicated move endpoint (`PUT /sets/:id/folder`)** — an explicit transition with its own contract; rejected: `folderId` on the existing set contracts is additive, keeps one editing surface, and needs no new client machinery.
- **Counts deferred (like tags)** — ADR-012 shipped `GET /tags` without counts; rejected here because a folder list without counts cannot answer "where is my stuff" at a glance, which is the entire point of the feature.

## Why

- Folders answer "browse by where I filed it", tags answer "filter by what it is", search answers "find by text" — three composable questions over one list, which is precisely the composition ADR-012 predicted when it deferred folders rather than choosing between them forever.
- Single-parent containment keeps every query a simple `WHERE` (no tree walks, no membership joins), keeps the UI a dropdown plus filter links, and keeps deletion a one-word migration clause.
- Reusing the tags naming discipline (per-user, case-insensitive, trimmed, bounded) means one mental model for "names the user owns" across both organizers.

## Tradeoffs

- One folder per set — "Cell biology" filed under "University" cannot also live in "Exams". That overlap is exactly what tags are for; the division of labor is the design.
- No nesting — deep collections stay flat for now; `parent_id` is a later additive migration.
- No "Unfiled" view in MVP — folderless sets are visible under "All sets"; a dedicated bucket is deferred.
- Folder counts add a GROUP BY to `GET /folders` — negligible at personal-library scale.
- Folder-level sharing is undefined — Phase 2's sharing slice will have to decide what a shared set's folder means; recorded here so it is not rediscovered.

## Consequences

- FOLD-002 adds the schema and migration `0009_*` (with schema docs); FOLD-003 the folders repository (owner-scoped CRUD + counts, and the placement check the set writes will call); FOLD-004 the `/folders` endpoints and the `folderId` contract additions; FOLD-005 the dashboard's `?folder=` filter and `lib/folders.ts`; FOLD-006 the `/folders` management page and the forms' folder select; FOLD-007 the E2E journey; FOLD-008 the docs sweep (ARCHITECTURE decision-table row).
- ARCHITECTURE's data model gains the `folders` table and the `folder_id` edge; the dashboard's §56 no-matches hint gains a third nameable filter.
- Recorded deferrals: nested folders, bulk move, an "Unfiled" view, folder-level sharing.

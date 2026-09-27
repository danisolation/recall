# ADR-012: Organization — tags

## Context

The §78 MVP surface is shipped: sets, cards, study, progress, and search. The last MVP item is organization — and §78 mandates choosing **either folders or tags** for MVP, with the other arriving in Phase 2 (§80). The library is a flat, paginated, searchable dashboard list; a growing collection needs a way to group and filter it. The schema has no organizational entity today, so this decision lands before any table exists (the study/progress/search pattern). Constraints that shape the choice: folders imply hierarchy (trees, move semantics, or at least containment), tags imply many-to-many labeling; deleting either must never destroy sets (sets are content — ADR-009's cascade philosophy stops at content); and the dashboard already has search, so organization only has to beat "scroll or type".

## Decision

- **Tags win for MVP.** A set can carry any number of the user's own labels ("biology", "exam prep"), which matches how a personal library actually grows — a set is rarely in exactly one bucket — and keeps the MVP version free of hierarchy decisions.
- **Schema** (ORG-002): `tags` (id, user_id FK cascade, name, timestamps) and `set_tags` (set_id FK cascade, tag_id FK cascade, unique `(set_id, tag_id)`, plus an index leading on `tag_id` for reverse lookups). No `user_id` on the join — ownership flows through both parents, and assigning a tag requires it to belong to the set's owner (§41, enforced in the repository). Tag names are unique **per user, case-insensitively** (expression unique index on `(user_id, lower(name))`), display preserving the first-created casing; names are 1–50 characters after trimming. A set carries **at most 10 tags** — a payload/UI ceiling, validated with 400 beyond (§53).
- **API** (ORG-003/004): `GET /tags` lists the caller's tags (id + name — no counts in MVP). `PUT /sets/:id/tags` **replaces** a set's tag list from `{ tags: string[] }`: owner-only, names trimmed and deduped, unknown names created for the caller, 404 `SET_NOT_FOUND` for a foreign/missing set. Replace (not add/remove pairs) because the natural UI is one tags field on the set forms — one endpoint, one contract. There is **no tag delete/rename endpoint in MVP** — tags accumulate with their owner; the deferral is recorded.
- **Filter** (ORG-005): `GET /sets?tag=<tagId>` extends the existing collection's filters, composing with `q` (ADR-011) — the URL keeps both because they answer different questions ("contains this text" AND "labeled this"). The id (not the name) is the parameter: stable and unambiguous, with the dashboard building links from `GET /tags`.
- **Surface** (ORG-006/007): the set create/edit forms gain a single tags field (comma-separated names — no tag-picker component before the product needs one); the dashboard gains tag filter links above the list, composing with the search box. Same three §56 states as search: empty library, no matches for the tag/text combination, results.
- **No schema or behavior changes** to study, progress, or search beyond the one composed query parameter. The other option (folders) is Phase 2's recorded addition (§80).

## Alternatives

- **Folders for MVP** — the Quizlet-style model and a natural fit for semester/course organization, but the honest version needs hierarchy decisions (nested or flat?), move semantics, and tree navigation UI; a flat folder list is just tags with fewer labels per set. Folders arrive in Phase 2 on top of tags, where "file a set into a folder" composes with "a set is labeled".
- **Both in MVP** — rejected by §78's explicit choose-one and by §87: neither organizational entity has users yet.
- **`PUT /sets/:id/tags` as add/remove pair endpoints** — two contracts and a client that computes diffs for what is conceptually "these are this set's labels"; replace is one request and idempotent by nature.
- **Tag names normalized to lowercase in storage** — makes uniqueness trivial but destroys display casing; the case-insensitive expression index keeps display as typed.
- **Filtering by tag name in the URL** — friendlier to hand-typed URLs but ambiguous the day rename arrives (a rename would break saved URLs); ids are stable.

## Why

- Tags model the real relationship (a set can belong to several groupings at once) without committing the product to a hierarchy it has not earned.
- The MVP slice is the smallest honest one: two tables, one replace endpoint, one list endpoint, one composed query parameter, two small UI additions — no tree widgets, no move flows.
- Deletion semantics stay trivial and content-safe: removing a tag takes only its join rows, never a set.
- Both surfaces the feature touches (set forms, dashboard) already exist, so the slice adds fields and links rather than new pages.

## Tradeoffs

- No tag rename/delete in MVP — a misspelled tag lives until Phase 2 tooling arrives; the unique-per-user rule bounds the damage.
- The 10-tags-per-set ceiling is arbitrary — chosen to keep the form and payload legible; raising it is a one-line change.
- Case-insensitive uniqueness means "Biology" cannot coexist with "biology" — the first casing wins display; acceptable for a personal library.
- Folders are still coming in Phase 2 (§80), so the schema will grow a second organizational dimension — tags were chosen precisely because they compose with that rather than fight it.

## Consequences

- ORG-002 adds the two tables and migration (with schema docs); ORG-003 the tag repository (create-or-get, per-set replace inside a transaction, per-user list, per-set list); ORG-004 the two endpoints; ORG-005 the `?tag=` filter composing with `q`; ORG-006 the forms' tags field; ORG-007 the dashboard filter links; ORG-008 the E2E journey.
- The `GET /sets` contract gains a second optional query parameter — additive, and it composes with `q` rather than replacing it.
- Phase 2's folder addition (§80) will treat folders as containment over this labeling layer; nothing in this schema assumes tags are the only organization.
- Tag rename/delete, tag counts, and tag-picker autocomplete are recorded deferrals for Phase 2 tooling.

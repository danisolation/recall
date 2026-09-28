# ADR-017: Removing the folders feature

## Context

Folders shipped as Phase 2's opening slice (ADR-014, `FOLD-001..008`): a `folders` table, `study_sets.folder_id` with `ON DELETE SET NULL`, `GET/POST/PATCH/DELETE /folders`, a `folderId` field on the set contracts, a `?folder=` dashboard filter composing with `?q=` and `?tag=`, a `/folders` management page with inline rename and two-step delete, a folder select on both set forms, and an E2E journey. After living with it, the feature has not earned its surface: the product's organization story is carried by **tags** (ADR-012) and search (ADR-011), the single-parent "shelf" model overlaps them, and every axis it added — a management page, a select on two forms, a filter parameter, an ownership check inside the set-update path — is maintenance surface for a workflow that never became habit. Per §127 (developer understanding per change is the optimization target) and the deletion-over-addition principle, the right move is to remove the feature entirely rather than let it linger half-maintained. ADR-014 stands as the record of why folders were built; this ADR supersedes it.

## Decision

- **Remove folders completely — delete, not deprecate.** No feature flag, no compatibility shim, no hidden column: every file, field, endpoint, filter, and test row the feature added goes away. Half-removed state is the drift the constitution exists to prevent.
- **Removal is top-down, one atomic task per layer**, so every intermediate state builds and the diff of each stays reviewable: the web UI first (pages, forms, filters, its lib fetcher, the E2E journey), then the API surface (folders module, contract fields, `?folder=` filter, the ownership check in the set-update path), then the schema (`study_sets.folder_id` + its index dropped, then the `folders` table).
- **The data is dropped with the schema.** The migration removes the column (placements die with it) and the table. This is deliberate and user-directed; the migration file is the record of what was deleted.
- **Tags and search are the organization story.** Tags' many-to-many labeling with `?tag=` composing against `?q=` survives untouched; no "shelf" concept replaces folders.
- **ADRs are records, not state.** ADR-014 is neither edited nor deleted; the docs sweep marks it superseded by this ADR and corrects the living documents (module map, route map, data model, status lines, counts).

## Alternatives

- **Keep folders but stop surfacing them** — the worst option: all the schema and API surface remains, none of it used, all of it drifting.
- **Fold folders into tags** (a folder becomes a tag) — merges two different semantics (single-parent containment vs many-to-many labeling) into one overloaded concept, and silently re-labels the user's sets.
- **Remove only the UI** — leaves an API and schema nobody calls; the drift cost without the simplification.

## Why

- Two organization systems for a personal library is one more than the workflow uses; tags already cover labeling, filtering, and composition with search.
- Removal is the rare change that *reduces* understanding load: 38 files of references disappear, one API module dissolves, the contracts and schema shrink, and every future reader spares themselves the containment-vs-labeling distinction.
- Top-down ordering means the API and database never have dead consumers at any commit boundary: the web stops sending `folderId` before the API stops accepting it, and the API stops referencing the column before the schema drops it.

## Tradeoffs

- Folder rows and set placements are irreversibly dropped — the user data cost is accepted and recorded in the migration.
- Re-adding folders later means a new migration and re-learning ADR-014's containment semantics; git history preserves both the code and the reasoning.
- The dashboard loses one filter axis (`?folder=`); `?q=` and `?tag=` remain, and search was the more-used of the three.
- Test counts drop (folders schema, integration, component, and E2E suites shrink) — recorded in the sweep, not hidden.

## Consequences

- RMFOLD-002 removes the web surface (including the folders E2E journey); RMFOLD-003 the API module, contract fields, filter, and update-path ownership check; RMFOLD-004 the schema and migration; RMFOLD-005 the docs sweep with fresh counts.
- `packages/contracts` loses `folders.schema.ts` and the `folderId` fields on the set schemas; `updateSetSchema`'s "Nothing to update" refine narrows accordingly.
- ARCHITECTURE's module map, route map, and data model lose their folder rows; ADR-014's decision-table row gains a "superseded by ADR-017" annotation in the sweep.
- Recorded for the future: if a "shelf" concept ever returns, ADR-014's containment analysis is the starting point — the case for it would have to be stronger than it was the first time.

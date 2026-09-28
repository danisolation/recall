# Progress

Status report for `danisolation-recall`, updated 2026-09-28.

This file summarizes what has been achieved and where the project is going. `docs/TASKS.md` is the authoritative atomic task ledger; `docs/ROADMAP.md` is the full forward-looking roadmap.

---

## Achieved so far

### Foundation

- All `FOUNDATION-*` tasks complete: constitution, task ledger, roadmap, monorepo scaffold (pnpm + Turborepo), NestJS API, Next.js web app, Docker Compose PostgreSQL, Drizzle data layer, health check, environment documentation, and the handoff documentation set (DOCS-001).

### Contracts

- `CONTRACTS-001..003`: validation and contracts decision (ADR-004), `packages/contracts` as the single validation language, request bodies validated via `nestjs-zod` DTOs with a global Zod validation pipe and a reshaping exception filter.

### Authentication

- `AUTH-001..024` complete end to end: register and login screens on the ADR-008 design foundation, httpOnly-cookie sessions with only the SHA-256 token hash stored (ADR-007), a guarded API, logout with server-side revocation, per-IP login rate limiting, a protected route group, and Playwright coverage over the real stack.

### Study sets and cards

- `SET-001..014`: full set lifecycle — create, list, view, edit, delete — plus the dashboard library.
- `CARD-001..014`: cards reached only through their set, study-order management with move-to-position reordering, and all UI controls.

### Study loop

- `STUDY-001..014`, designed once in ADR-009: sessions with the `ACTIVE → COMPLETED/ABANDONED` state machine, binary reviews (insert-only history), an atomic review + progress upsert, an isolated pure Leitner-ladder scheduler (`schedule()`), the card-by-card study screen, an idempotent finish wired into pass completion, and a completion view with counts and accuracy.

### Progress

- `PROGRESS-001..007`, designed once in ADR-010: a dedicated `/progress` page with review counts, derived accuracy, session history, and the due queue (`next_review_at <= now`); counts-only summary and paginated due-list endpoints; session history endpoint.

### Search

- `SEARCH-001..004`, designed once in ADR-011: a `q` filter on `GET /sets` (owner-scoped `ILIKE` over title and description, metacharacters escaped), the dashboard search box driving `?q=` URL state with zero client JavaScript, and a distinct no-matches state.

### Organization

- `ORG-001..008`, designed once in ADR-012: tags chosen over folders for MVP — `tags`/`set_tags` tables (case-insensitive per-user names, ≤10 tags per set), `GET /tags`, the replace-style `PUT /sets/:id/tags`, a `GET /sets?tag=` semijoin composing with `q`, tags on both set forms, dashboard tag-filter chips, and an organization E2E journey.

### UI polish

- `UX-001..008`, designed once in ADR-013 (amends ADR-008): the panel/link registers centralized as real `components/ui` exports, `lucide-react` icons beside unchanged labels app-wide, button-variant nav links, tag chips, a true 3D card flip with keyboard shortcuts (Space/1/2) and a progress bar on the study screen, stat panels and status badges on progress, a landing hero with a feature trio, skeleton loading states, and a favicon with theme metadata. All copy, accessible names, and hrefs survived the restyle; the pre-existing tests passed unmodified throughout.

### Folders (Phase 2)

- `FOLD-001..008`, designed once in ADR-014 (Phase 2's opening slice, per §80's deferral): single-parent containment — `folders` plus `study_sets.folder_id` with `ON DELETE SET NULL`, so deleting a folder unfiles its sets instead of deleting them; per-user case-insensitive names on the tags discipline; `GET/POST/PATCH/DELETE /folders` with per-folder set counts; `folderId` on the set contracts (absent leaves placement, null unfiles, a number files); a `?folder=` dashboard filter composing with `?q=` and `?tag=`; a `/folders` management page with inline rename and two-step delete; the folder select on both set forms; and an E2E journey covering composition and the safe delete. An accessibility audit (A11Y-001) landed a skip link along the way. **The feature was subsequently removed entirely** (ADR-017, `RMFOLD-001..005`): the tags-plus-search organization carried the workflow, and the shelf never earned its surface — schema dropped in migration `0011_flippant_wasp.sql`, ADR-014 superseded but preserved.

### Sharing (Phase 2)

- `SHARE-001..007`, designed once in ADR-015: a `visibility` token on `study_sets` (`private`/`public`, sets start private) that rides the update path only; `PATCH /sets/:id` validating it through the shared contracts enum; `GET /public/sets/:id` — the app's only unauthenticated endpoint — serving a whitelist payload (title, description, tags, study-ordered cards; never the owner's id, folder placement, or the token itself), with private, foreign, and missing sets folding into the same 404; a Sharing select on the edit form and a Sharing row on the detail page; an unauthenticated read-only `/share/sets/[id]` page outside the protected group (no cookie is ever sent, no owner data, no action controls); and an E2E journey covering the whole loop — toggle public, open the share URL in a session-less browser, unshare, watch it 404.

### Documentation

- DOCS-001 handoff set plus DOCS-002's refresh: README, ARCHITECTURE (module map, route map, data model, key decisions), CONTRIBUTING, environment docs, schema reference, tech-debt ledger, and the ADR series (ORM, contracts, sessions, design system, study sessions, progress, search, organization, UI polish, folders, sharing).

---

## Current state

- 6 pnpm workspace packages; 9 tables; migrations applied through `0011_flippant_wasp.sql` (the folder-removal drop).
- Test suites green: API 238 (unit + HTTP/DB integration), web 196 (component + lib), contracts 53 (schema), E2E 11 (Playwright journeys: auth, sets, cards, study, progress, search, organization, sharing).
- **The §78 MVP surface is shipped** (including organization — tags, ADR-012), the UI polish phase landed (ADR-013), **Phase 2 has opened**: sharing (ADR-015) lets an owner publish a set by URL and take it back with one toggle — and folders (ADR-014) were removed again (ADR-017) after failing to earn their keep.

## Plans for the future

### Now

- The rest of Phase 2 per `docs/ROADMAP.md`: media, streaks, notifications — each new phase opens with an ADR (the house pattern). The daily-streaks phase is decomposed and waiting (`STREAK-002..006`, ADR-016).

### Next

- Redis (cache, rate-limit storage, queues) + background worker — including the expired-session cleanup job deferred from the auth hardening block.

### Later

- Phase 3: AI-assisted learning, semantic search, recommendations, adaptive learning; observability.

# Progress

Status report for `danisolation-recall`, updated 2026-09-27.

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

### Documentation

- DOCS-001 handoff set plus DOCS-002's refresh: README, ARCHITECTURE (module map, route map, data model, key decisions), CONTRIBUTING, environment docs, schema reference, tech-debt ledger, and the ADR series (ORM, contracts, sessions, design system, study sessions, progress, search, organization, UI polish).

---

## Current state

- 6 pnpm workspace packages; 9 tables; migrations applied through `0008_silky_thena.sql`.
- Test suites green: API 234 (unit + HTTP/DB integration), web 183 (component + lib), contracts 51 (schema), E2E 10 (Playwright journeys: auth, sets, cards, study, progress, search, organization).
- **The §78 MVP surface is shipped**, including organization (tags, ADR-012), and the post-MVP UI polish phase (ADR-013) has landed on top of it.

## Plans for the future

### Now

- Phase 2 per `docs/ROADMAP.md`: sharing, folders on top of tags (§80), media, streaks, notifications — each new phase opens with an ADR (the house pattern).

### Next

- Redis (cache, rate-limit storage, queues) + background worker — including the expired-session cleanup job deferred from the auth hardening block.

### Later

- Phase 3: AI-assisted learning, semantic search, recommendations, adaptive learning; observability.

# Progress

Status report for `danisolation-recall`, updated 2026-09-10.

This file summarizes what has been achieved and where the project is going. `docs/TASKS.md` is the authoritative atomic task ledger; `docs/ROADMAP.md` is the full forward-looking roadmap.

---

## Achieved so far

The foundation phase is complete. All `FOUNDATION-*` tasks are marked `DONE`.

### Project setup

- FOUNDATION-001 — Persisted the constitution (`AGENT_RULES.md`)
- FOUNDATION-002 — Initialized the git repository
- FOUNDATION-003 — Created the task ledger (`docs/TASKS.md`)
- FOUNDATION-004 — Created the roadmap (`docs/ROADMAP.md`)
- FOUNDATION-005 — Created the README
- FOUNDATION-006 — Added `.gitignore`

### Monorepo scaffold

- FOUNDATION-007 — Root manifest, pnpm workspaces, Turborepo
- FOUNDATION-008 — Shared TypeScript config (`packages/typescript-config`)
- FOUNDATION-009 — Shared ESLint config (`packages/eslint-config`)

### Applications

- FOUNDATION-010 — NestJS API (`apps/api`) builds and boots
- FOUNDATION-011 — Next.js web app (`apps/web`) builds

### Infrastructure and data

- FOUNDATION-012 — Local PostgreSQL via Docker Compose (`infra/docker`)
- FOUNDATION-013 — Drizzle database layer (`packages/database`) with an initial `users` migration and `ADR-003` (ORM selection)

---

## Current state

- 6 pnpm workspace packages
- Next.js 16 (App Router, React 19) and NestJS 11 both build successfully
- Drizzle + PostgreSQL layer is scaffolded; the `users` migration is generated but not yet applied
- Docker Compose defines a local PostgreSQL 17 instance with a named volume and healthcheck

---

## Plans for the future

### Now

- Wire the API to the database (NestJS ConfigModule + Drizzle client)
- MVP: authentication, study sets, cards, study sessions, progress, search, organization
- Environment documentation

### Next

- Phase 2: sharing, tags/folders, images/audio, streaks, notifications
- Redis for caching, rate limiting, and queues; background worker

### Later

- Phase 3: AI-assisted learning, semantic search, recommendations, adaptive learning
- Object storage, search abstraction, observability, async workflows

### Maybe

- Phase 4: social and collaboration features
- Extract selected modules into services only when justified

# DANISOLATION Recall

A modern flashcard and learning platform inspired by concepts behind tools like Quizlet.

## Status

Foundation complete: the monorepo is scaffolded, `apps/web` (Next.js) and `apps/api` (NestJS) build, and the Drizzle + PostgreSQL data layer is scaffolded. See [`docs/PROGRESS.md`](docs/PROGRESS.md) for the latest status and [`docs/ROADMAP.md`](docs/ROADMAP.md) for direction.

## Vision

The platform should eventually allow users to:

- create flashcard sets and cards
- study cards with reveal-and-answer flow
- track progress and review history
- use spaced repetition
- search content
- use AI-assisted learning features (later)

## Architecture (planned)

A modular monolith:

- **Web:** Next.js + React + TypeScript
- **API:** NestJS + TypeScript
- **Database:** PostgreSQL

Complexity is introduced only when a concrete problem justifies it.

## Repository layout

Current:

- `AGENT_RULES.md` — operating constitution for the AI agent
- `apps/` — web (Next.js), api (NestJS)
- `packages/` — database, eslint-config, typescript-config
- `infra/docker/` — local PostgreSQL via Docker Compose
- `docs/` — roadmap, tasks, progress, and ADRs

Planned:

- `apps/worker` — background worker
- `packages/` — ui, domain, contracts, validation, and other shared packages
- `scripts/` — development utilities

## Getting started

```text
git clone <repo>
pnpm install
docker compose -f infra/docker/docker-compose.yml up
pnpm dev
```

## Documentation

- Progress: [`docs/PROGRESS.md`](docs/PROGRESS.md)
- Roadmap: [`docs/ROADMAP.md`](docs/ROADMAP.md)
- Tasks: [`docs/TASKS.md`](docs/TASKS.md)
- Agent rules: [`AGENT_RULES.md`](AGENT_RULES.md)

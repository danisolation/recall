# DANISOLATION Recall

A modern flashcard and learning platform inspired by concepts behind tools like Quizlet.

## Status

Early foundation. The repository currently contains only project documentation and planning artifacts; no application code exists yet.

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
- `docs/ROADMAP.md` — high-level product and engineering direction
- `docs/TASKS.md` — atomic, near-term tasks

Planned:

- `apps/` — web, api, worker
- `packages/` — shared ui, domain, database, contracts, config
- `infra/` — docker, local, deployment
- `scripts/` — development utilities

## Getting started

Not runnable yet. Once scaffolded, the target developer flow is:

```text
git clone <repo>
pnpm install
docker compose up
pnpm dev
```

## Documentation

- Roadmap: [`docs/ROADMAP.md`](docs/ROADMAP.md)
- Tasks: [`docs/TASKS.md`](docs/TASKS.md)
- Agent rules: [`AGENT_RULES.md`](AGENT_RULES.md)

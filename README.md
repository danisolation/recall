# DANISOLATION Recall

A modern flashcard and learning platform inspired by concepts behind tools like Quizlet. A personal project engineered with real-world discipline: modular monolith, typed end to end, atomic task ledger, decision records.

## Status

- **Monorepo** — pnpm workspaces + Turborepo: `apps/web` (Next.js 16), `apps/api` (NestJS 11), `packages/` (database, contracts, eslint-config, typescript-config)
- **Authentication is complete end to end** — register and login screens validating with the same schemas as the API, httpOnly-cookie sessions, a protected `/dashboard` gated server-side, guarded API routes, logout, login rate limiting, and a Playwright journey over the real stack
- **PostgreSQL 17** via Docker Compose with Drizzle ORM migrations
- Next up (see [`docs/TASKS.md`](docs/TASKS.md)): the study-sets phase

## Requirements

- Node.js ≥ 22 (`engines` in `package.json`)
- pnpm 10.33.2 — pinned via `packageManager`; `corepack enable` picks it up
- Docker (for PostgreSQL)

## Quickstart

```bash
pnpm install
cp .env.example apps/api/.env
docker compose -f infra/docker/docker-compose.yml up -d
pnpm --filter @danisolation-recall/database db:migrate
pnpm dev
```

- Web: `http://localhost:3000`
- API: `http://localhost:3001` (health check at `/health`)
- The web app proxies `/api/*` to the API server-side, so the session cookie stays first-party (`API_ORIGIN` to change the target)

## Testing

```bash
DATABASE_URL=postgresql://recall:recall@localhost:5432/recall pnpm test   # all packages (Turborepo builds dependencies first)
```

`DATABASE_URL` must be set (with PostgreSQL running) for the API integration tests; it is passed through to tasks via `turbo.json` (`test.passThroughEnv`).

Per package:

```bash
DATABASE_URL=postgresql://recall:recall@localhost:5432/recall pnpm --filter @danisolation-recall/api test
pnpm --filter @danisolation-recall/web test
pnpm --filter @danisolation-recall/contracts test
```

End-to-end (Playwright, Chromium — starts its own API and web servers on ports 3100/3101):

```bash
pnpm --filter @danisolation-recall/web exec playwright install chromium  # once
pnpm --filter @danisolation-recall/web test:e2e
```

API integration tests hit the real PostgreSQL from Docker Compose and require `DATABASE_URL`. Unit tests do not. See [`CONTRIBUTING.md`](CONTRIBUTING.md) for workflow and known gotchas.

## Repository layout

```text
apps/
  web/      Next.js 16 App Router frontend (Tailwind v4, React Hook Form)
  api/      NestJS 11 API (auth module, database module, health)
packages/
  database/       Drizzle schema, client, migrations
  contracts/      Zod schemas shared by API and web (ADR-004)
  eslint-config/  Shared flat ESLint config
  typescript-config/  Shared strict tsconfig base
infra/docker/     docker-compose.yml for PostgreSQL 17
docs/             Roadmap, tasks, progress, ADRs, API and database docs
AGENT_RULES.md    Operating constitution for the (AI) engineer — read first
```

## Documentation

| Document | Purpose |
| --- | --- |
| [`AGENT_RULES.md`](AGENT_RULES.md) | Project constitution: task workflow, engineering rules (§-numbered) |
| [`docs/TASKS.md`](docs/TASKS.md) | Atomic task ledger — the source of truth for what to do next |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | Where the project is going (Now / Next / Later / Maybe) |
| [`docs/PROGRESS.md`](docs/PROGRESS.md) | What has been achieved so far |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | System overview, module map, auth flow, key decisions |
| [`ENVIRONMENT.md`](ENVIRONMENT.md) | Environment variables and local development flow |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Setup, everyday commands, task workflow, gotchas |
| [`docs/api/auth.md`](docs/api/auth.md) | Auth API endpoint reference (shapes, error codes) |
| [`docs/database/schema.md`](docs/database/schema.md) | Database schema and migration workflow |
| [`docs/TECH-DEBT.md`](docs/TECH-DEBT.md) | Intentionally deferred work, with rationale |
| [`docs/adr/`](docs/adr/) | Architecture decision records (ORM, contracts, sessions, design system) |

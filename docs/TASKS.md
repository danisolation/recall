# Tasks

Atomic, near-term implementation tasks for `danisolation-recall`.

Status values: `TODO`, `READY`, `IN_PROGRESS`, `BLOCKED`, `DONE`, `DEFERRED`.

Future MVP work is listed at a coarse level at the bottom until its implementation context is sufficiently known. Only near-term foundation work is decomposed into detailed tasks.

---

## FOUNDATION-001

### Title
Persist the project constitution

### Goal
Create `AGENT_RULES.md` as the permanent operational constitution for the agent.

### Dependencies
None

### Status
DONE

### Files
AGENT_RULES.md

### Acceptance Criteria
- `AGENT_RULES.md` exists at the repository root
- contains the full master prompt / project constitution

### Tests
None (documentation only)

---

## FOUNDATION-002

### Title
Initialize git repository

### Goal
Make the directory version-controlled so subsequent work is reviewable.

### Dependencies
FOUNDATION-001

### Status
DONE

### Files
.git/

### Acceptance Criteria
- `git init` succeeded
- `git status` reports a valid repository

### Tests
- verified with `git status`

---

## FOUNDATION-003

### Title
Create the task ledger

### Goal
Create `docs/TASKS.md` with the near-term foundation task breakdown.

### Dependencies
FOUNDATION-002

### Status
DONE

### Files
docs/TASKS.md

### Acceptance Criteria
- `docs/TASKS.md` exists
- foundation tasks are listed with status, dependencies, and acceptance criteria
- MVP phases are listed at a coarse level only

### Tests
None (documentation only)

---

## FOUNDATION-004

### Title
Create the roadmap

### Goal
Create `docs/ROADMAP.md` with high-level product and engineering phases.

### Dependencies
FOUNDATION-003

### Status
DONE

### Files
docs/ROADMAP.md

### Acceptance Criteria
- `docs/ROADMAP.md` exists
- phases use `Now` / `Next` / `Later` / `Maybe`
- MVP and post-MVP work are separated

### Tests
None (documentation only)

---

## FOUNDATION-005

### Title
Create README

### Goal
Add a top-level project overview that matches the current repository state.

### Dependencies
FOUNDATION-004

### Status
DONE

### Files
README.md

### Acceptance Criteria
- `README.md` exists
- describes the project, local setup, and repository layout accurately

### Tests
None (documentation only)

---

## FOUNDATION-006

### Title
Create .gitignore

### Goal
Prevent build artifacts, dependencies, and secrets from being tracked.

### Dependencies
FOUNDATION-002

### Status
DONE

### Files
.gitignore

### Acceptance Criteria
- `node_modules`, build output, and `.env` files are ignored
- `.commandcode` handling is intentional and documented

### Tests
- `git status` no longer lists ignored artifacts

---

## FOUNDATION-007

### Title
Scaffold monorepo root

### Goal
Add root `package.json`, `pnpm-workspace.yaml`, and `turbo.json` to establish the monorepo.

### Dependencies
FOUNDATION-002

### Status
DONE

### Files
package.json
pnpm-workspace.yaml
turbo.json

### Acceptance Criteria
- root `package.json` declares the package name and pnpm package manager
- `pnpm-workspace.yaml` lists the `apps` and `packages` workspaces
- `turbo.json` defines build, dev, lint, typecheck, and test tasks

### Tests
- JSON files parse successfully

---

## FOUNDATION-008

### Title
Add shared TypeScript config package

### Goal
Create `packages/typescript-config` with a strict base `tsconfig` that apps can extend.

### Dependencies
FOUNDATION-007

### Status
DONE

### Files
packages/typescript-config/package.json
packages/typescript-config/base.json

### Acceptance Criteria
- package is scoped as `@danisolation-recall/typescript-config`
- `base.json` enables strict TypeScript settings
- JSON files parse successfully

### Tests
- JSON files parse successfully

---

## FOUNDATION-009

### Title
Add shared ESLint config package

### Goal
Create `packages/eslint-config` with a flat config base that apps can extend.

### Dependencies
FOUNDATION-007

### Status
DONE

### Files
packages/eslint-config/package.json
packages/eslint-config/base.js

### Acceptance Criteria
- package is scoped as `@danisolation-recall/eslint-config`
- `base.js` exports a flat ESLint config using recommended rules
- `package.json` parses and `base.js` is syntactically valid

### Tests
- JSON parses successfully
- `base.js` passes a Node syntax check

---

## FOUNDATION-010

### Title
Scaffold NestJS API

### Goal
Create a minimal NestJS app in `apps/api` that builds and boots.

### Dependencies
FOUNDATION-008
FOUNDATION-009

### Status
DONE

### Files
apps/api/package.json
apps/api/tsconfig.json
apps/api/tsconfig.build.json
apps/api/nest-cli.json
apps/api/src/main.ts
apps/api/src/app.module.ts
apps/api/src/app.controller.ts
apps/api/src/app.service.ts

### Acceptance Criteria
- `apps/api` is a workspace package named `@danisolation-recall/api`
- the app has a module, controller, and service
- `tsconfig.json` extends the shared TypeScript config
- dependencies install and the app builds

### Tests
- `pnpm install` succeeds
- `pnpm --filter @danisolation-recall/api build` succeeds

---

## FOUNDATION-011

### Title
Scaffold Next.js web app

### Goal
Create a minimal Next.js app in `apps/web` that builds.

### Dependencies
FOUNDATION-008

### Status
DONE

### Files
apps/web/package.json
apps/web/tsconfig.json
apps/web/next.config.mjs
apps/web/next-env.d.ts
apps/web/src/app/layout.tsx
apps/web/src/app/page.tsx

### Acceptance Criteria
- `apps/web` is a workspace package named `@danisolation-recall/web`
- the app uses the App Router with a root layout and home page
- `tsconfig.json` extends the shared TypeScript config
- dependencies install and the app builds

### Tests
- `pnpm install` succeeds
- `pnpm --filter @danisolation-recall/web build` succeeds

---

## FOUNDATION-012

### Title
Add local PostgreSQL via Docker Compose

### Goal
Provide a local PostgreSQL instance through Docker Compose for development.

### Dependencies
FOUNDATION-002

### Status
DONE

### Files
infra/docker/docker-compose.yml
infra/docker/.env.example

### Acceptance Criteria
- compose file defines a `postgres:17-alpine` service with a named volume and healthcheck
- credentials are configurable via environment variables with local defaults
- `.env.example` documents the environment variables
- the compose file validates

### Tests
- `docker compose -f infra/docker/docker-compose.yml config` succeeds

---

## FOUNDATION-013

### Title
Set up database layer with Drizzle

### Goal
Create `packages/database` with Drizzle, an initial schema, and a connection client, and record the ORM decision.

### Dependencies
FOUNDATION-008
FOUNDATION-012

### Status
DONE

### Files
packages/database/package.json
packages/database/tsconfig.json
packages/database/drizzle.config.ts
packages/database/src/schema.ts
packages/database/src/index.ts
packages/database/drizzle/0000_strange_master_mold.sql
docs/adr/ADR-003-orm-selection.md
.env.example

### Acceptance Criteria
- Drizzle and pg are installed in `packages/database`
- `src/schema.ts` defines a `users` table
- `src/index.ts` exports a Drizzle client and fails clearly when `DATABASE_URL` is missing
- `drizzle-kit` generates the initial migration
- ADR-003 records the Drizzle decision

### Tests
- `pnpm install` succeeds
- `pnpm --filter @danisolation-recall/database db:generate` succeeds
- `pnpm --filter @danisolation-recall/database typecheck` succeeds

---

## FOUNDATION-014

### Title
Wire the API to the database

### Goal
Add database and config dependencies to `apps/api`, provide the Drizzle client through a global `DatabaseModule`, and expose a health check.

### Dependencies
FOUNDATION-013

### Status
DONE

### Files
apps/api/package.json
apps/api/src/database/database.module.ts
apps/api/src/health/health.controller.ts
apps/api/src/app.module.ts
packages/database/package.json
packages/database/tsconfig.json
packages/database/tsconfig.build.json
packages/database/src/index.ts

### Acceptance Criteria
- `@danisolation-recall/database` and `@nestjs/config` are added to `apps/api`
- `packages/database` exports `createDb(connectionString)` instead of an import-time singleton
- `DatabaseModule` provides the Drizzle client using `DATABASE_URL`
- `GET /health` runs `SELECT 1`

### Tests
- `pnpm --filter @danisolation-recall/api typecheck` succeeds
- `pnpm --filter @danisolation-recall/api build` succeeds

---

## FOUNDATION-015

### Title
Apply initial migration and verify the database pipeline

### Goal
Start local PostgreSQL, apply the `users` migration, and verify the API health check.

### Dependencies
FOUNDATION-014

### Status
DONE

### Files
None (runtime verification)

### Acceptance Criteria
- migration applies successfully
- `users` table exists
- `GET /health` returns healthy

### Tests
- `docker compose -f infra/docker/docker-compose.yml up -d`
- `pnpm --filter @danisolation-recall/database db:migrate`
- `curl` the API health endpoint

---

## FOUNDATION-016

### Title
Add environment documentation

### Goal
Document required environment variables and the local development flow.

### Dependencies
FOUNDATION-015

### Status
DONE

### Files
ENVIRONMENT.md

### Acceptance Criteria
- documents `.env`, `DATABASE_URL`, Docker Compose, and the local dev flow
- matches the actual setup

### Tests
None (documentation only)

---

## Remaining foundation docs (coarse)

- `CONTRIBUTING.md`
- `ARCHITECTURE.md`
- `ENVIRONMENT.md`
- `docs/TECH-DEBT.md`

These will be created when their content is meaningful rather than empty placeholders.

---

## MVP phases (coarse — not yet decomposed)

```text
Authentication
  ↓
Study sets
  ↓
Cards
  ↓
Study sessions
  ↓
Progress
  ↓
Search
```

Each phase will be decomposed into detailed atomic tasks when its implementation context is known.

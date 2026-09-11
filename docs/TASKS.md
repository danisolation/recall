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
- `docs/TECH-DEBT.md`

These will be created when their content is meaningful rather than empty placeholders.

---

## Contracts phase

Decision recorded in ADR-004. Frontend auth tasks (AUTH-017+) consume schemas from `packages/contracts`.

### CONTRACTS-001

### Title
Record validation and contracts decision

### Goal
Document the validation approach and shared contracts decision in an ADR.

### Dependencies
AUTH-008

### Status
DONE

### Files
docs/adr/ADR-004-validation-and-contracts.md

### Acceptance Criteria
- ADR covers context, decision, alternatives, why, tradeoffs, consequences (§74)

### Tests
None (documentation only)

---

### CONTRACTS-002

### Title
Create packages/contracts

### Goal
Create the `@danisolation-recall/contracts` workspace package and move the registration schema into it.

### Dependencies
CONTRACTS-001

### Status
DONE

### Files
packages/contracts/package.json
packages/contracts/tsconfig.json
packages/contracts/tsconfig.build.json
packages/contracts/vitest.config.ts
packages/contracts/src/register.schema.ts
packages/contracts/src/register.schema.spec.ts
packages/contracts/src/index.ts
apps/api/src/auth/register.schema.ts (removed)
apps/api/src/auth/register.schema.spec.ts (removed)
apps/api/src/auth/register.service.ts
apps/api/src/auth/auth.controller.ts
apps/api/package.json

### Acceptance Criteria
- `registerSchema` and `RegisterInput` live in `packages/contracts`
- API consumes them as a workspace dependency

### Tests
- `pnpm --filter @danisolation-recall/contracts test` (6 schema tests)
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` (16 tests)

---

### CONTRACTS-003

### Title
Integrate nestjs-zod

### Goal
Replace per-controller `safeParse` with `nestjs-zod` DTOs and a validation pipe.

### Dependencies
CONTRACTS-002

### Status
DONE

### Files
apps/api/src/auth/auth.controller.ts
apps/api/src/common/zod-exception.filter.ts
apps/api/src/app.module.ts
apps/api/src/auth/auth.controller.spec.ts
apps/api/package.json

### Acceptance Criteria
- request bodies are validated through `createZodDto` and a Zod validation pipe
- error responses keep the `VALIDATION_ERROR` code shape

### Tests
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` (15 tests; 400 reshape covered by the HTTP integration test)
- `pnpm --filter @danisolation-recall/api typecheck` succeeds

---

## Authentication phase

Session mechanism decided in ADR-007 (`docs/adr/ADR-007-session-mechanism.md`): an opaque session token in an httpOnly cookie, persisted as a hash in PostgreSQL. The earlier recommendation (JWT in an httpOnly cookie) was rejected there because logout requires server-side invalidation.

### AUTH-001

### Title
Create users table

### Goal
Define the `users` table in the database schema.

### Dependencies
FOUNDATION-013

### Status
DONE

### Files
packages/database/src/schema.ts

### Acceptance Criteria
- table has id, email, created_at, updated_at

### Tests
None (completed in FOUNDATION-013)

---

### AUTH-002

### Title
Create users migration

### Goal
Generate the initial migration for the `users` table.

### Dependencies
AUTH-001

### Status
DONE

### Files
packages/database/drizzle/0000_strange_master_mold.sql

### Acceptance Criteria
- migration creates the `users` table

### Tests
None (completed in FOUNDATION-013)

---

### AUTH-003

### Title
Add password hash to users

### Goal
Add a `password_hash` column and migration for email/password authentication.

### Dependencies
AUTH-002

### Status
DONE

### Files
packages/database/src/schema.ts
packages/database/drizzle/0001_acoustic_black_widow.sql

### Acceptance Criteria
- `users` table gains a nullable `password_hash` column
- migration is generated

### Tests
- `pnpm --filter @danisolation-recall/database db:generate` succeeds
- `pnpm --filter @danisolation-recall/database db:migrate` succeeds

---

### AUTH-004

### Title
Add user database access

### Goal
Provide a Drizzle repository for user persistence (create, find by email, find by id).

### Dependencies
AUTH-003

### Status
DONE

### Files
apps/api/src/auth/users.repository.ts
apps/api/src/auth/users.repository.integration.spec.ts
packages/database/src/index.ts
apps/api/package.json

### Acceptance Criteria
- repository supports create, findByEmail, findById

### Tests
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` (4 integration tests)
- `pnpm --filter @danisolation-recall/api typecheck` succeeds

---

### AUTH-005

### Title
Add password hashing utility

### Goal
Provide argon2/bcrypt hash and verify helpers.

### Dependencies
AUTH-003

### Status
DONE

### Files
apps/api/src/auth/password.ts
apps/api/src/auth/password.spec.ts
apps/api/package.json

### Acceptance Criteria
- plaintext passwords are never stored
- hash and verify functions are tested

### Tests
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` (8 tests: 4 unit, 4 integration)
- `pnpm --filter @danisolation-recall/api typecheck` succeeds

---

### AUTH-006

### Title
Add registration input schema

### Goal
Define a Zod schema for registration input.

### Dependencies
AUTH-003

### Status
DONE

### Files
apps/api/src/auth/register.schema.ts
apps/api/src/auth/register.schema.spec.ts
apps/api/package.json

### Acceptance Criteria
- email and password are required and validated

### Tests
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` (14 tests: 10 unit, 4 integration)
- `pnpm --filter @danisolation-recall/api typecheck` succeeds

---

### AUTH-007

### Title
Add registration domain logic

### Goal
Create a user with a hashed password.

### Dependencies
AUTH-004
AUTH-005
AUTH-006

### Status
DONE

### Files
apps/api/src/auth/register.service.ts
apps/api/src/auth/register.service.spec.ts
apps/api/src/auth/users.repository.ts

### Acceptance Criteria
- duplicate email is rejected
- password is hashed before persistence

### Tests
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` (16 tests: 12 unit, 4 integration)
- `pnpm --filter @danisolation-recall/api typecheck` succeeds

---

### AUTH-008

### Title
Add registration endpoint

### Goal
Expose `POST /auth/register`.

### Dependencies
AUTH-007

### Status
DONE

### Files
apps/api/src/auth/auth.controller.ts
apps/api/src/auth/auth.module.ts
apps/api/src/auth/auth.controller.spec.ts
apps/api/src/auth/register.service.ts
apps/api/src/app.module.ts

### Acceptance Criteria
- valid input creates a user
- invalid input returns a validation error

### Tests
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` (19 tests: 15 unit, 4 integration)
- live smoke test: 201 valid / 409 duplicate (`EMAIL_ALREADY_REGISTERED`) / 400 invalid (`VALIDATION_ERROR`)

---

### AUTH-009

### Title
Add registration integration test

### Goal
Cover the registration flow end to end at the API layer.

### Dependencies
AUTH-008

### Status
DONE

### Files
apps/api/src/auth/register.integration.spec.ts
apps/api/vitest.config.ts
apps/api/package.json

### Acceptance Criteria
- success and duplicate-email cases are covered

### Tests
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` (22 tests, incl. 3 HTTP-level registration integration tests)

---

### AUTH-010

### Title
Add login input schema

### Goal
Define a Zod schema for login input.

### Dependencies
CONTRACTS-002

### Status
DONE

### Files
packages/contracts/src/login.schema.ts
packages/contracts/src/login.schema.spec.ts
packages/contracts/src/index.ts

### Acceptance Criteria
- email and password are required

### Tests
- `pnpm --filter @danisolation-recall/contracts test` (12 tests: 6 login, 6 register)

---

### AUTH-011

### Title
Add login domain logic

### Goal
Verify credentials and return the authenticated user.

### Dependencies
AUTH-004
AUTH-005
AUTH-010

### Status
DONE

### Files
apps/api/src/auth/login.service.ts
apps/api/src/auth/login.service.spec.ts
apps/api/src/auth/password.ts

### Acceptance Criteria
- wrong password or unknown email is rejected

### Tests
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` (20 tests)
- `pnpm --filter @danisolation-recall/api typecheck` succeeds

---

### AUTH-012

### Title
Add login endpoint

### Goal
Expose `POST /auth/login`.

### Dependencies
AUTH-011

### Status
DONE

### Files
apps/api/src/auth/auth.controller.ts
apps/api/src/auth/auth.module.ts
apps/api/src/auth/auth.controller.spec.ts
apps/api/tsconfig.build.json
apps/api/tsconfig.json
.gitignore

### Acceptance Criteria
- valid credentials return the authenticated user (session token arrives in AUTH-014)
- invalid credentials return an error

### Tests
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` (22 tests)
- live smoke test: 200 valid login / 401 wrong password / 401 unknown email (`INVALID_CREDENTIALS`)

---

### AUTH-013

### Title
Add login integration test

### Goal
Cover the login flow end to end at the API layer.

### Dependencies
AUTH-012

### Status
DONE

### Files
apps/api/src/auth/login.integration.spec.ts

### Acceptance Criteria
- success and failure cases are covered

### Tests
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` (26 tests, incl. 4 HTTP-level login integration tests)
- `pnpm --filter @danisolation-recall/api typecheck` succeeds

---

### AUTH-013A

### Title
Record session mechanism decision (ADR-007)

### Goal
Decide and document how sessions are issued, validated, and revoked before AUTH-014 depends on the decision.

### Dependencies
AUTH-012

### Status
DONE

### Files
docs/adr/ADR-007-session-mechanism.md

### Acceptance Criteria
- ADR covers context, decision, alternatives, why, tradeoffs, consequences (§74)
- the decision is compatible with AUTH-014, AUTH-015, and AUTH-017

### Tests
None (documentation only)

---

### AUTH-014

### Title
Add session persistence

### Goal
Issue and persist the authenticated session per ADR-007.

### Dependencies
AUTH-012

### Status
READY

### Files
apps/api/src/auth/session.ts
packages/database (sessions table + migration)

### Acceptance Criteria
- login returns a session credential (per ADR-007: httpOnly cookie)
- session can be validated on subsequent requests

### Tests
- unit tests

---

### AUTH-015

### Title
Add authentication guard

### Goal
Protect routes that require an authenticated user.

### Dependencies
AUTH-014

### Status
TODO

### Files
apps/api/src/modules/auth/auth.guard.ts

### Acceptance Criteria
- unauthenticated requests are rejected
- authenticated requests populate the current user

### Tests
- guard unit tests

---

### AUTH-016

### Title
Add protected route integration test

### Goal
Verify an authenticated route is protected.

### Dependencies
AUTH-015

### Status
TODO

### Files
apps/api/src/modules/auth/protected.integration.spec.ts

### Acceptance Criteria
- protected route rejects missing or invalid credentials

### Tests
- integration test

---

### AUTH-017

### Title
Add logout

### Goal
Invalidate the current session.

### Dependencies
AUTH-014

### Status
TODO

### Files
apps/api/src/modules/auth/auth.controller.ts

### Acceptance Criteria
- logout clears the session credential

### Tests
- endpoint integration test

---

### AUTH-018

### Title
Add login frontend screen

### Goal
Build the login page UI.

### Dependencies
AUTH-012

### Status
TODO

### Files
apps/web/src/app/login/*

### Acceptance Criteria
- page renders email and password fields

### Tests
- component test

---

### AUTH-019

### Title
Add login form validation

### Goal
Validate login form input on the client.

### Dependencies
AUTH-018

### Status
TODO

### Files
apps/web/src/app/login/*

### Acceptance Criteria
- invalid input shows clear errors

### Tests
- component test

---

### AUTH-020

### Title
Connect login frontend to API

### Goal
Submit login credentials to the API and persist the session.

### Dependencies
AUTH-019

### Status
TODO

### Files
apps/web/src/app/login/*

### Acceptance Criteria
- successful login stores the session and redirects

### Tests
- component test

---

### AUTH-021

### Title
Add authentication E2E test

### Goal
Cover the full login and logout journey in a browser.

### Dependencies
AUTH-020

### Status
TODO

### Files
apps/web/e2e/auth.spec.ts

### Acceptance Criteria
- register, login, protected route, and logout are covered

### Tests
- Playwright E2E test

---

## Remaining MVP phases (coarse — not yet decomposed)

```text
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

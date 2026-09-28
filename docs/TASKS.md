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
DONE

### Files
packages/database/src/schema.ts
packages/database/src/index.ts
packages/database/drizzle/0002_stiff_xavin.sql
apps/api/src/auth/session.ts
apps/api/src/auth/auth.controller.ts
apps/api/src/auth/auth.module.ts
apps/api/src/auth/session.spec.ts
apps/api/src/auth/session.integration.spec.ts
apps/api/src/auth/auth.controller.spec.ts
apps/api/package.json

### Acceptance Criteria
- login returns a session credential (per ADR-007: httpOnly cookie)
- session can be validated on subsequent requests

### Tests
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` (36 tests: 6 session unit, 4 session integration incl. expiry, updated controller spec asserting the cookie)
- `pnpm --filter @danisolation-recall/api typecheck` succeeds
- `pnpm --filter @danisolation-recall/database typecheck` succeeds
- migration `0002_stiff_xavin.sql` applied; `sessions` table verified in psql

---

### AUTH-015

### Title
Add authentication guard

### Goal
Protect routes that require an authenticated user.

### Dependencies
AUTH-014

### Status
DONE

### Files
apps/api/src/auth/auth.guard.ts
apps/api/src/auth/auth.guard.spec.ts
apps/api/src/app.module.ts
apps/api/package.json

### Acceptance Criteria
- unauthenticated requests are rejected
- authenticated requests populate the current user

### Tests
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` (39 tests, incl. 3 guard unit tests: missing cookie, unknown token, valid session populating `request.currentUser`)
- `pnpm --filter @danisolation-recall/api typecheck` succeeds

---

### AUTH-016

### Title
Add protected route integration test

### Goal
Verify an authenticated route is protected.

### Dependencies
AUTH-015

### Status
DONE

### Files
apps/api/src/auth/protected.integration.spec.ts
apps/api/src/auth/auth.guard.ts
apps/api/src/auth/auth.controller.ts

### Acceptance Criteria
- protected route rejects missing or invalid credentials

### Tests
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` (43 tests, incl. 4 HTTP-level tests over `GET /auth/me`: 401 without cookie, 401 with invalid cookie, 200 with the session cookie from login, and the ADR-007 cookie flags (HttpOnly, SameSite=Lax, Expires))

---

### AUTH-017

### Title
Add logout

### Goal
Invalidate the current session.

### Dependencies
AUTH-014

### Status
DONE

### Files
apps/api/src/auth/auth.controller.ts
apps/api/src/auth/session.ts
apps/api/src/auth/session.integration.spec.ts
apps/api/src/auth/auth.controller.spec.ts
apps/api/src/auth/logout.integration.spec.ts

### Acceptance Criteria
- logout clears the session credential

### Tests
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` (48 tests, incl. 5 session integration tests with `revoke` coverage, a controller unit test, and 3 HTTP-level logout tests: 401 without cookie, 204 revoking + clearing the cookie, and the pre-logout cookie failing `GET /auth/me` afterwards)

---

### AUTH-018

### Title
Add login frontend screen

### Goal
Build the login page UI.

### Dependencies
AUTH-012

### Status
DONE

### Files
apps/web/src/app/login/page.tsx
apps/web/src/app/login/login-form.tsx
apps/web/src/app/login/login-form.spec.tsx
apps/web/vitest.config.ts
apps/web/vitest.setup.ts
apps/web/package.json

### Acceptance Criteria
- page renders email and password fields

### Tests
- `pnpm --filter @danisolation-recall/web test` (1 component test: labeled email and password inputs with submit button)
- `pnpm --filter @danisolation-recall/web typecheck` succeeds
- `pnpm --filter @danisolation-recall/web build` succeeds (`/login` prerendered)

---

### AUTH-018A

### Title
Record frontend design system decision (ADR-008)

### Goal
Decide and document the styling stack, design register, and interaction floor before AUTH-019/020 harden the login markup.

### Dependencies
AUTH-018

### Status
DONE

### Files
docs/adr/ADR-008-frontend-design-system.md

### Acceptance Criteria
- ADR covers context, decision, alternatives, why, tradeoffs, consequences (§74)
- the decision covers the §56/§57/§58/§59 quality bars and the Tailwind v4 token approach

### Tests
None (documentation only)

---

### AUTH-018B

### Title
Apply design foundation to the login screen

### Goal
Author the design tokens and first UI primitives, and style the login screen with them per ADR-008.

### Dependencies
AUTH-018A

### Status
DONE

### Files
apps/web/postcss.config.mjs
apps/web/src/app/globals.css
apps/web/src/app/layout.tsx
apps/web/src/app/login/page.tsx
apps/web/src/app/login/login-form.tsx
apps/web/src/components/ui/button.tsx
apps/web/src/components/ui/input.tsx
apps/web/src/components/ui/field-error.tsx
apps/web/src/components/ui/field-error.spec.tsx
apps/web/vitest.config.ts
apps/web/package.json

### Acceptance Criteria
- tokens (OKLCH palette, spacing rhythm, type scale) are declared via `@theme` in `globals.css`
- login form uses Button/Input primitives with visible focus states and a 44px touch-target submit
- error text style exists for AUTH-019 to consume
- interaction floor from ADR-008 is met (focus-visible, reduced motion, sentence-case copy)

### Tests
- `pnpm --filter @danisolation-recall/web test` (3 tests: login form fields/button, FieldError render + empty render)
- `pnpm --filter @danisolation-recall/web typecheck` succeeds
- `pnpm --filter @danisolation-recall/web build` succeeds (`/login` prerendered)
- visual verification via browser screenshots: resting state and focused field (marker label highlight + ink focus ring) match ADR-008

---

### AUTH-019

### Title
Add login form validation

### Goal
Validate login form input on the client.

### Dependencies
AUTH-018

### Status
DONE

### Files
packages/contracts/src/login.schema.ts
apps/web/src/app/login/login-form.tsx
apps/web/src/app/login/login-form.spec.tsx
apps/web/package.json

### Acceptance Criteria
- invalid input shows clear errors

### Tests
- `pnpm --filter @danisolation-recall/web test` (5 tests: empty submit shows the two schema messages and never calls `onValid`; valid input submits normalized values with no errors)
- `pnpm --filter @danisolation-recall/contracts test` (12 tests, unchanged behavior with user-facing messages)
- `pnpm --filter @danisolation-recall/web typecheck` succeeds
- `pnpm --filter @danisolation-recall/web build` succeeds

---

### AUTH-020

### Title
Connect login frontend to API

### Goal
Submit login credentials to the API and persist the session.

### Dependencies
AUTH-019

### Status
DONE

### Files
apps/web/src/lib/api.ts
apps/web/src/app/login/login-form.tsx
apps/web/src/app/login/login-form.spec.tsx
apps/web/next.config.mjs
ENVIRONMENT.md

### Acceptance Criteria
- successful login stores the session and redirects

### Tests
- `pnpm --filter @danisolation-recall/web test` (7 tests: invalid input never submits; success calls the API with normalized values and redirects to `/`; 401 shows "Email or password is incorrect."; unexpected failures show the generic error)
- `pnpm --filter @danisolation-recall/web typecheck` succeeds
- `pnpm --filter @danisolation-recall/web build` succeeds
- live smoke test through the rewrite proxy: browser login with a registered user redirected to `/` and `GET /api/auth/me` from the same session returned the user (first-party session cookie)

---

### AUTH-020A

### Title
Rate limit login attempts

### Goal
Protect `POST /auth/login` against brute-force attempts with simple per-IP rate limiting (§68).

### Dependencies
AUTH-012

### Status
DONE

### Files
apps/api/src/auth/rate-limit.guard.ts
apps/api/src/auth/auth.module.ts
apps/api/src/auth/auth.controller.ts
apps/api/src/auth/rate-limit.integration.spec.ts
apps/api/package.json

### Acceptance Criteria
- more than 5 login attempts per minute from one IP return 429 with the `RATE_LIMITED` code
- other auth routes are not throttled by this guard
- error body keeps the `{ code, message }` house shape

### Decision
`@nestjs/throttler` (in-memory storage; Redis adapter is the documented Phase-2 swap), method-scoped on login only, 5 attempts per 60s per IP, custom `throwThrottlingException` for the house error shape. Account-level lockout deliberately avoided: IP-based limiting cannot be weaponized to lock a victim out.

### Tests
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` (50 tests, incl. 2 rate-limit integration tests: 5×401 then 429 `RATE_LIMITED`; register unaffected)
- `pnpm --filter @danisolation-recall/api typecheck` succeeds

---

### AUTH-021

### Title
Add authentication E2E test

### Goal
Cover the full login and logout journey in a browser.

### Dependencies
AUTH-020

### Status
DONE

### Files
apps/web/e2e/auth.spec.ts
apps/web/playwright.config.ts
apps/web/vitest.config.ts
apps/web/package.json
.gitignore

### Acceptance Criteria
- register, login, protected route, and logout are covered

### Note
The journey runs end to end through the real system (browser → rewrite proxy → API → PostgreSQL). Originally only login had a UI, so register and logout were arranged through the API; AUTH-022 (register) and AUTH-023 (logout) have since moved those legs into the browser.

### Tests
- `pnpm --filter @danisolation-recall/web test:e2e` (2 Playwright tests: register → UI login → redirect → authenticated `/api/auth/me` → logout → revoked session returns 401; invalid credentials shows "Email or password is incorrect." and stays on `/login`)
- `pnpm --filter @danisolation-recall/web test` (7 component tests — vitest scoped to `src/` so it does not pick up the Playwright spec)
- `pnpm --filter @danisolation-recall/web typecheck` and `build` succeed

---

### AUTH-022

### Title
Add register frontend screen

### Goal
Let a new user create an account from the browser instead of the API.

### Dependencies
AUTH-020

### Status
DONE

### Files
apps/web/src/app/register/page.tsx
apps/web/src/app/register/register-form.tsx
apps/web/src/app/register/register-form.spec.tsx
apps/web/src/components/ui/form-field.tsx
apps/web/src/lib/api.ts
apps/web/src/app/login/login-form.tsx
apps/web/src/app/login/page.tsx
apps/web/e2e/auth.spec.ts
apps/web/playwright.config.ts
packages/contracts/src/register.schema.ts
apps/api/src/auth/auth.module.ts
apps/api/src/auth/auth.controller.ts

### Acceptance Criteria
- page validates with `registerSchema` from `@danisolation-recall/contracts`
- duplicate email and validation failures show clear errors
- success logs the user in or redirects to login

### Decisions
- `registerSchema` gained user-facing messages (unchanged rules), so both API and browser show "Use at least 8 characters" instead of zod defaults.
- Success auto-signs-in (register then login) rather than bouncing the user to a login screen to retype credentials.
- The shared `Field` composition moved out of `login-form.tsx` into `components/ui/form-field.tsx` now that a second form consumes it.
- Login rate limiting is now configurable (`THROTTLE_LIMIT` / `THROTTLE_TTL_MS`) so repeated E2E logins don't trip the 5/min ceiling; defaults are unchanged.

### Tests
- `pnpm --filter @danisolation-recall/web test` (11 tests, incl. 4 register tests: short password shows "Use at least 8 characters" and does not submit; success registers, signs in, redirects and normalizes the email; duplicate email shows "An account with this email already exists.")
- `pnpm --filter @danisolation-recall/web test:e2e` (3 Playwright tests — registration now runs through the UI)
- `pnpm --filter @danisolation-recall/contracts test` (12) and `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` (50) pass
- `pnpm typecheck` and `pnpm --filter @danisolation-recall/web build` (`/register` prerendered) succeed; page visually verified

---

### AUTH-023

### Title
Add logout control and authenticated state

### Goal
Expose the current session in the UI and let the user log out.

### Dependencies
AUTH-021

### Status
DONE

### Files
apps/web/src/lib/session.ts
apps/web/src/lib/api.ts
apps/web/src/app/page.tsx
apps/web/src/app/page.spec.tsx
apps/web/src/components/logout-button.tsx
apps/web/src/components/logout-button.spec.tsx
apps/web/src/components/ui/button.tsx
apps/web/e2e/auth.spec.ts

### Acceptance Criteria
- authenticated state is visible to the user
- a logout control revokes the session and returns to the login screen

### Decisions
- The session is read server-side (`lib/session.ts` forwards the browser's `Cookie` header to `GET /auth/me` with `cache: "no-store"`) rather than fetched client-side: no signed-out flash, the httpOnly cookie never reaches JS, and the page is the real App Router pattern. `/` becomes a dynamic route as a result.
- Logout calls `POST /auth/logout` (which clears the cookie server-side), then `router.replace("/login")` + `router.refresh()` so the home page re-renders from the server as signed out.
- `Button` gained a `secondary` variant; the marker accent stays reserved for primary actions (ADR-008), so the logout control is neutral.
- Signed in: the header names the user and offers "Log out". Signed out: it offers "Log in" / "Create account".

### Tests
- `pnpm --filter @danisolation-recall/web test` (16 tests, incl. 3 LogoutButton tests — revokes and redirects; disabled while in flight; error keeps the user put — and 2 Home tests — signed-in email + control vs. signed-out links)
- `pnpm --filter @danisolation-recall/web test:e2e` (3 Playwright tests; login → logout now driven through the UI, asserting the redirect and that `/api/auth/me` returns 401 afterwards)
- `pnpm --filter @danisolation-recall/web typecheck` and `build` succeed (`/` is dynamic, auth pages stay static); signed-in and signed-out states visually verified

---

### AUTH-024

### Title
Add a protected page with server-side session check

### Goal
Provide a real protected route in the web app (not just the API), redirecting unauthenticated visitors.

### Dependencies
AUTH-023

### Status
DONE

### Files
apps/web/src/app/(protected)/layout.tsx
apps/web/src/app/(protected)/layout.spec.tsx
apps/web/src/app/(protected)/dashboard/page.tsx
apps/web/src/app/(protected)/dashboard/page.spec.tsx
apps/web/src/components/user-menu.tsx
apps/web/src/components/user-menu.spec.tsx
apps/web/src/lib/session.ts
apps/web/src/lib/session.spec.ts
apps/web/src/app/page.tsx
apps/web/e2e/auth.spec.ts

### Acceptance Criteria
- unauthenticated visitors are redirected to `/login`
- authenticated visitors see their own data

### Decisions
- The gate lives in a **route group** — `(protected)/layout.tsx` — so every future page under it (study sets, study sessions) is protected by construction instead of per-page copy-paste. The URL is unaffected by the group.
- Authorization is checked in the server component, not in edge middleware: the session is an opaque token whose SHA-256 hash must be looked up in PostgreSQL, so validating it in middleware would mean an extra HTTP round trip to the API and splitting auth logic. `redirect("/login")` from the server component is the authoritative check.
- `getCurrentUser` is wrapped in React's `cache()`, so the layout and the page share one `GET /auth/me` per request (verified: one call per `/dashboard` render, down from two).
- The dashboard re-checks the session for TypeScript narrowing and to survive a session expiring between the two checks rather than dereferencing a null user.
- Dates render in a fixed locale and `UTC` so server and client markup match on hydration.
- `/dashboard` shows the user's own account data (email, member since) — the first page that has no meaning without a session.

### Tests
- `pnpm --filter @danisolation-recall/web test` (24 tests, incl. layout + dashboard redirect-vs-render, and `getCurrentUser`'s three paths: no cookie → no API call, valid cookie forwarded → user, rejected session → null)
- `pnpm --filter @danisolation-recall/web test:e2e` (4 Playwright tests; unauthenticated `/dashboard` redirects to `/login`, and the authenticated journey reaches `/dashboard`, sees its own email, then logs out)
- `pnpm --filter @danisolation-recall/web typecheck` and `build` succeed (`/dashboard` is dynamic); redirect and authenticated page visually verified

---

### Auth hardening (coarse — not yet decomposed)

Real-world hardening deferred until the MVP surface stabilizes; each will be decomposed when its context is known:

- rate limiting for registration (same mechanism as AUTH-020A)
- per-IP keying behind the rewrite proxy: honor `X-Forwarded-For` via Express trust proxy at deployment (§108); in dev all proxied traffic shares one IP
- structured request logging with request ids (§63)
- security headers (§42)
- expired-session cleanup job (§47, worker phase)

---

## Documentation phase

### DOCS-001

### Title
Write machine-independent handoff documentation

### Goal
Make the project fully pick-up-able on another machine: accurate entry points, architecture, API and database references, workflow guide, and tech-debt ledger.

### Dependencies
AUTH-020A

### Status
DONE

### Files
README.md
ARCHITECTURE.md
CONTRIBUTING.md
docs/PROGRESS.md
docs/TECH-DEBT.md
docs/api/auth.md
docs/database/schema.md

### Acceptance Criteria
- a fresh clone can be set up and run from README + CONTRIBUTING alone (§72)
- documentation matches the actual implementation (§73) — no aspirational content
- §76-format tech-debt ledger replaces implicit knowledge
- Mermaid diagrams cover the system and auth flow (§77)

### Tests
None (documentation only; facts cross-checked against code, manifests, and running containers)

---

### DOCS-002

### Title
Refresh the handoff documentation for the MVP-complete state

### Goal
Bring the standing documentation back in line with the shipped implementation (§73): the README status, ARCHITECTURE.md's module map / API surface / data model, and PROGRESS.md all predate the sets, cards, study, progress, and search phases.

### Dependencies
SEARCH-004

### Status
DONE

### Files
README.md
ARCHITECTURE.md
docs/PROGRESS.md

### Acceptance Criteria
- README's status and repository layout describe the shipped MVP, not the auth-era state
- ARCHITECTURE.md's module map lists every API and web module that now exists; the API surface maps every route and the full error-code register; the data model covers all seven tables and the cascade story
- PROGRESS.md reflects the completed phases with current test counts and names what actually comes next (the organization decision, Phase 2)
- no aspirational content — every claim matches the repository (§73)

### Decision
The refresh is claim-by-claim against the repository, not a rewrite: README's status now says the MVP is shipped (naming each phase and its ADR) with the organization decision as what's next, and its layout line lists all five API modules; ARCHITECTURE.md's API module map gains sets/cards/study/progress rows, the web map covers every protected route and the four cookie-forwarding lib fetchers, the API surface section gains a complete route map (14 routes) plus the full ten-code error register — with the absence of per-domain `docs/api/*.md` files for the newer modules stated as a documented follow-up rather than papered over — and the data model tells the three-layer story (identity → content → learning) with the cascade rule. PROGRESS.md was rewritten around the completed phases with current counts (API 210 / web 139 / contracts 45 / E2E 9, seven tables, migration `0007`). One self-caught error: the draft claimed "eleven ADRs" — the directory holds seven, and the number was corrected to match the filesystem (§73 forbids aspirational documentation). Deliberately out of scope: writing `docs/api/` references for the four newer modules (a follow-up task if wanted) and the organization decision itself.

### Tests
None (documentation only; claims cross-checked against the module directories, the route map in the controllers, the migrations directory, the ADR directory, and the latest test-run counts)

---

## Study sets phase

API design per §52: `GET/POST /sets`, `GET/PATCH/DELETE /sets/:id`. Every endpoint requires an authenticated session (AuthGuard); ownership is enforced server-side (§41). Input schemas live in `packages/contracts` (ADR-004).

### SET-001

### Title
Add the study_sets table and migration

### Goal
Define the `study_sets` table in the database schema and generate its migration.

### Dependencies
None (builds on the existing `users` table)

### Status
DONE

### Files
packages/database/src/schema.ts
packages/database/drizzle/0003_lazy_oracle.sql
docs/database/schema.md

### Acceptance Criteria
- table has id, owner_id (FK → users, on delete cascade), title (not null), description (nullable), created_at, updated_at — following the existing serial/timezone conventions
- index on owner_id for owner-scoped queries
- migration is generated and applies cleanly
- schema documentation updated

### Tests
- `pnpm --filter @danisolation-recall/database db:generate` produced `drizzle/0003_lazy_oracle.sql` (table, cascade FK, owner index)
- `pnpm --filter @danisolation-recall/database db:migrate` applied it; `study_sets` verified in psql (columns, `ON DELETE CASCADE` FK, `study_sets_owner_id_index`)
- `pnpm --filter @danisolation-recall/database typecheck` and `build` succeed

---

### SET-002

### Title
Add study set input schemas to contracts

### Goal
Define Zod schemas for creating and updating a study set.

### Dependencies
None

### Status
DONE

### Files
packages/contracts/src/set.schema.ts
packages/contracts/src/set.schema.spec.ts
packages/contracts/src/index.ts

### Acceptance Criteria
- `createSetSchema`: title required (1–255 characters after trimming), description optional (max 2000 characters), with user-facing messages
- `updateSetSchema`: all fields optional, rejects an empty update
- inferred types (`CreateSetInput`, `UpdateSetInput`) exported

### Decision
Both schemas trim values via the `transform().pipe()` pattern established by the auth schemas; messages follow the same register (sentence case, no trailing period). A whitespace-only title is rejected (it trims to empty). An empty-string description is accepted and means "no description".

### Tests
- `pnpm --filter @danisolation-recall/contracts test` (24 tests, incl. 12 new: valid input, trimming, description optional, empty/whitespace/256-char title, 2001-char description, missing fields; title-only/description-only update, trimmed update, empty update rejected)
- `pnpm --filter @danisolation-recall/contracts typecheck` succeeds

---

### SET-003

### Title
Add set database access

### Goal
Provide a Drizzle repository for study set persistence.

### Dependencies
SET-001

### Status
DONE

### Files
apps/api/src/sets/sets.repository.ts
apps/api/src/sets/sets.repository.integration.spec.ts
packages/database/src/index.ts

### Acceptance Criteria
- repository supports create, findById, listByOwner, update, delete
- every query is owner-scoped (§41)
- listByOwner is offset-paginated, newest first

### Decision
Every query filters by `owner_id` in SQL (not in a service layer): `findById`, `update`, and `delete` all take the owner alongside the id, so a wrong owner is indistinguishable from a missing row. `listByOwner` orders by `created_at DESC` with `id DESC` as a tiebreaker (same-transaction timestamps can be identical). `packages/database/src/index.ts` gained the `desc` re-export — apps funnel all drizzle helpers through the database package.

### Tests
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` (63 tests, incl. 13 new repository integration tests: create with/without description, find by id, other-user's set not found, unknown id, newest-first ordering, list excludes other users, limit/offset pagination, partial update + `updated_at` bump, update/delete by wrong owner rejected, repeat delete not found)
- `pnpm --filter @danisolation-recall/api typecheck` succeeds

---

### SET-004

### Title
Add create set endpoint (POST /sets)

### Goal
Allow an authenticated user to create a study set.

### Dependencies
SET-002
SET-003

### Status
DONE

### Files
apps/api/src/sets/sets.module.ts
apps/api/src/sets/sets.controller.ts
apps/api/src/sets/create-set.service.ts
apps/api/src/sets/create-set.service.spec.ts
apps/api/src/sets/create-set.integration.spec.ts
apps/api/src/auth/auth.module.ts
apps/api/src/app.module.ts

### Acceptance Criteria
- authenticated users can create a set; ownership is assigned from the session user
- body validated via `createZodDto`; invalid input returns 400 `VALIDATION_ERROR`
- 201 with an explicit response shape; 401 `UNAUTHENTICATED` without a session

### Decision
`SetsModule` imports `AuthModule` and `AuthModule` now exports `SessionService` — the guard's dependency must be visible to the consuming module's injector for `@UseGuards(AuthGuard)` to resolve. Validation needs no per-route pipe: the global `ZodValidationPipe` (APP_PIPE) reshapes failures into 400 `VALIDATION_ERROR`. Ownership comes from the session (`@CurrentUser()`), never from the request body.

### Tests
- `pnpm --filter @danisolation-recall/api test` (68 tests, incl. 2 new service unit tests and 3 HTTP-level tests: 201 returns the created row with trimmed title and ownership from the session, 401 without cookie `UNAUTHENTICATED`, 400 with empty title `VALIDATION_ERROR`)
- `pnpm --filter @danisolation-recall/api typecheck` and `build` succeed

---

### SET-005

### Title
Add list sets endpoint (GET /sets)

### Goal
Return the authenticated user's own sets, paginated.

### Dependencies
SET-004

### Status
DONE

### Files
apps/api/src/sets/sets.controller.ts
apps/api/src/sets/list-sets.integration.spec.ts

### Acceptance Criteria
- only the caller's sets are returned, newest first
- explicit paginated envelope (items + next offset)

### Decision
Offset pagination, limit default 20 and capped at 100 (§36: acceptable for simple low-scale lists; revisit cursor pagination if lists grow). The cap rejects with 400 `VALIDATION_ERROR` instead of silently clamping — explicit contracts over hidden corrections (§53). Query params are coerced and validated by a `listSetsQuerySchema` (file-local to the controller, promoted to contracts if the web ever needs to construct queries). `nextOffset` is `offset + limit` when a full page came back and `null` otherwise — a total that is an exact multiple of the limit costs one extra empty-page call, which beats a `COUNT(*)` per list request.

### Tests
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` (72 tests, incl. 4 new HTTP-level tests: envelope with newest-first items and row shape, limit/offset slicing with `nextOffset` transitions 2 → null, another user's sets excluded, 400 `VALIDATION_ERROR` for `limit=101` and `offset=-1`)
- `pnpm --filter @danisolation-recall/api typecheck` and `build` succeed

---

### SET-006

### Title
Add get set endpoint (GET /sets/:id)

### Goal
Return a single set to its owner.

### Dependencies
SET-004

### Status
DONE

### Files
apps/api/src/sets/sets.controller.ts
apps/api/src/sets/get-set.integration.spec.ts

### Acceptance Criteria
- owner receives 200 with the set
- missing or not-owned set returns 404 `SET_NOT_FOUND`

### Decision
A set owned by another user returns 404 — indistinguishable from a missing set, since all sets are private in MVP. `SET_ACCESS_DENIED` is reserved for the Phase-2 visibility model. Malformed ids (`/sets/not-a-number`) fold into the same 404: the controller parses the param and never sends a non-integer to PostgreSQL (a `NaN` bind would surface as a 500).

### Tests
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` (76 tests, incl. 4 new HTTP-level tests: 200 with the full row for the owner, 404 `SET_NOT_FOUND` for a missing id, 404 for a malformed id, 404 for another user's set)
- `pnpm --filter @danisolation-recall/api typecheck` and `build` succeed

---

### SET-007

### Title
Add update set endpoint (PATCH /sets/:id)

### Goal
Let the owner edit a set's title and description.

### Dependencies
SET-002
SET-006

### Status
DONE

### Files
apps/api/src/sets/sets.controller.ts
apps/api/src/sets/update-set.integration.spec.ts

### Acceptance Criteria
- owner-only partial update validated by `updateSetSchema`
- updated set returned with `updated_at` bumped
- 404 for missing or not-owned set; 400 for an empty update

### Tests
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` (82 tests, incl. 6 new HTTP-level tests: title-only and description-only updates with the other field intact, trimmed values, `updated_at` bumped, 404 `SET_NOT_FOUND` for missing and foreign sets, 400 `VALIDATION_ERROR` for an empty update)
- `pnpm --filter @danisolation-recall/api typecheck` and `build` succeed

### Note
`parseSetId` was extracted to a shared controller helper (GET and PATCH both use it; DELETE will next).

---

### SET-008

### Title
Add delete set endpoint (DELETE /sets/:id)

### Goal
Let the owner delete a set.

### Dependencies
SET-006

### Status
DONE

### Files
apps/api/src/sets/sets.controller.ts
apps/api/src/sets/delete-set.integration.spec.ts

### Acceptance Criteria
- owner-only; 204 on success
- 404 for missing or not-owned set; a repeat delete returns 404

### Note
When the cards phase adds a cards table, its foreign key will be `ON DELETE CASCADE` so set deletion removes its cards.

### Tests
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` (86 tests, incl. 4 new HTTP-level tests: 204 with the set then 404 on `GET /sets/:id`, 404 `SET_NOT_FOUND` for a missing set, 404 for another user's set which is left intact, 404 on a repeat delete)
- `pnpm --filter @danisolation-recall/api typecheck` and `build` succeed

---

### SET-009

### Title
Add the create set screen

### Goal
Let an authenticated user create a set from the browser.

### Dependencies
SET-002
SET-004

### Status
DONE

### Files
apps/web/src/app/(protected)/sets/new/page.tsx
apps/web/src/app/(protected)/sets/new/create-set-form.tsx
apps/web/src/app/(protected)/sets/new/create-set-form.spec.tsx
apps/web/src/app/(protected)/dashboard/page.tsx
apps/web/src/app/(protected)/dashboard/page.spec.tsx
apps/web/src/lib/api.ts

### Acceptance Criteria
- form validates with `createSetSchema` via `zodResolver`
- success navigates to the new set's detail page
- API errors show clear messages (§56)
- the dashboard offers a "New set" entry point

### Decision
On success the form navigates to the new set's detail page (`/sets/:id`) — that page is built in SET-011, so the journey completes then. `createSet` in `lib/api.ts` returns only `{ id }` (all the client needs); the detail data stays server-fetched. The dashboard "New set" entry reuses the home page's link register rather than growing the Button primitive with link semantics (§59).

### Tests
- `pnpm --filter @danisolation-recall/web test` (28 tests, incl. 4 new CreateSetForm tests: renders labeled fields, empty title shows "Enter a title" and never calls the API, success calls `createSet` with normalized values and pushes `/sets/42`, API failure shows the error message and stays put — plus a dashboard assertion for the "New set" link)
- `pnpm --filter @danisolation-recall/web typecheck` succeeds
- `pnpm --filter @danisolation-recall/web build` succeeds (`/sets/new` is dynamic under the protected layout)

---

### SET-010

### Title
Add the sets list to the dashboard

### Goal
Show the user's sets on the protected dashboard.

### Dependencies
SET-005

### Status
DONE

### Files
apps/web/src/app/(protected)/dashboard/page.tsx
apps/web/src/app/(protected)/dashboard/page.spec.tsx
apps/web/src/components/set-list.tsx
apps/web/src/components/set-list.spec.tsx
apps/web/src/lib/sets.ts
apps/web/src/lib/sets.spec.ts

### Acceptance Criteria
- a server component fetches `GET /sets` with the forwarded cookie (same pattern as `lib/session.ts`)
- items link to their detail page
- the empty state offers creating a set (§56)

### Decision
`lib/sets.ts` mirrors `lib/session.ts`: a server-only fetch that forwards the browser's httpOnly cookie with `cache: "no-store"` and returns an empty page without calling the API when no cookie exists (the protected layout has already gated the request). `SetList` is a presentational server component with no client JS — items are card-style links to `/sets/:id` in the ADR-008 register, and the empty state offers "Create a set" per §56; headings stay in the page so the component stays reusable. The sets section sits above "Your account" since sets are the product's primary content. An API failure surfaces through Next's error boundary rather than an inline retry state — acceptable for a server-rendered MVP dashboard.

### Tests
- `pnpm --filter @danisolation-recall/web test` (35 tests, incl. 7 new: SetList renders each set as a link to its detail page and offers "Create a set" when empty; `listSets` forwards the cookie and returns the paginated envelope, returns an empty page without a cookie without calling the API, and throws on API failure; the dashboard renders the "Your sets" section with detail links and the create-a-set empty state)
- `pnpm --filter @danisolation-recall/web typecheck` succeeds
- `pnpm --filter @danisolation-recall/web build` succeeds (`/dashboard` is dynamic)

---

### SET-011

### Title
Add the set detail page

### Goal
View a single set.

### Dependencies
SET-006

### Status
DONE

### Files
apps/web/src/app/(protected)/sets/[id]/page.tsx
apps/web/src/app/(protected)/sets/[id]/page.spec.tsx
apps/web/src/lib/sets.ts
apps/web/src/lib/sets.spec.ts

### Acceptance Criteria
- server fetch of `GET /sets/:id` with the forwarded cookie
- renders title, description, and timestamps
- 404 (missing or not owned) leads to `notFound()`

### Decision
`getSet` joins `listSets` in `lib/sets.ts` (same cookie-forwarding, `no-store` pattern); a 404 response maps to `null` — covering both a missing set and a set owned by someone else, which SET-006 made indistinguishable — and the page turns `null` into `notFound()`. A non-integer route param also calls `notFound()` before any fetch, mirroring the API's `parseSetId` decision of never sending a non-integer downstream. Dates render with the dashboard's fixed-locale/UTC `Intl` pattern for hydration safety. This page completes the create-set journey: the form (SET-009) and the dashboard list (SET-010) both navigate to `/sets/:id`.

### Tests
- `pnpm --filter @danisolation-recall/web test` (42 tests, incl. 7 new: `getSet` forwards the cookie and returns the set, returns null without a cookie, maps 404 to null, throws on other failures; the page renders title/description/timestamps, calls `notFound()` for a missing or foreign set, and calls `notFound()` for a malformed id without calling the API)
- `pnpm --filter @danisolation-recall/web typecheck` succeeds
- `pnpm --filter @danisolation-recall/web build` succeeds (`/sets/[id]` is dynamic)

---

### SET-012

### Title
Add set editing

### Goal
Let the owner edit a set from the browser.

### Dependencies
SET-007
SET-011

### Status
DONE

### Files
apps/web/src/app/(protected)/sets/[id]/edit/page.tsx
apps/web/src/app/(protected)/sets/[id]/edit/page.spec.tsx
apps/web/src/app/(protected)/sets/[id]/edit/edit-set-form.tsx
apps/web/src/app/(protected)/sets/[id]/edit/edit-set-form.spec.tsx
apps/web/src/app/(protected)/sets/[id]/page.tsx
apps/web/src/app/(protected)/sets/[id]/page.spec.tsx
apps/web/src/lib/api.ts
apps/web/src/lib/api.spec.ts

### Acceptance Criteria
- form is prefilled and validated with `updateSetSchema`
- success re-renders the updated data
- API errors show clear messages

### Decision
The form sends a full update (title + description, prefilled via `defaultValues`) — the schema's "Nothing to update" refine can never trigger from the form, and clearing the title correctly surfaces "Enter a title" because `partial()` keeps the transform/pipe. Success navigates back to `/sets/:id`, so the updated data re-renders through the server fetch (same journey as creation) rather than duplicating detail rendering client-side. `updateSet` maps `404 SET_NOT_FOUND` to "This set no longer exists." and everything else to a generic save-failure message; the private `post` helper was generalized to `request(method, path, data?)` instead of duplicating a `patch` variant. The detail page gained an "Edit set" link (one line, outside the task's original file list but the only reachable entry point) using the existing text-link register — no new Button semantics.

### Tests
- `pnpm --filter @danisolation-recall/web test` (52 tests, incl. 10 new: `updateSet` patches with credentials and resolves, maps `SET_NOT_FOUND` and other failures to clear errors; the form renders prefilled, submits the update and navigates to `/sets/42`, blocks an empty title without calling the API, and shows the API error; the edit page prefills and 404s for missing/foreign/malformed ids; the detail page links to `/sets/:id/edit`)
- `pnpm --filter @danisolation-recall/web typecheck` succeeds
- `pnpm --filter @danisolation-recall/web build` succeeds (`/sets/[id]/edit` is dynamic)

---

### SET-013

### Title
Add set deletion

### Goal
Let the owner delete a set from the browser.

### Dependencies
SET-008
SET-011

### Status
DONE

### Files
apps/web/src/app/(protected)/sets/[id]/page.tsx
apps/web/src/app/(protected)/sets/[id]/page.spec.tsx
apps/web/src/app/(protected)/sets/[id]/delete-set-button.tsx
apps/web/src/app/(protected)/sets/[id]/delete-set-button.spec.tsx
apps/web/src/lib/api.ts
apps/web/src/lib/api.spec.ts

### Acceptance Criteria
- a delete control asks for confirmation before deleting
- success redirects to the dashboard
- a 404 after the set is gone is handled

### Decision
The control is a two-step inline confirmation (Delete set → "Delete this set? This cannot be undone." + Confirm delete/Cancel) rather than a `window.confirm` or a new Dialog primitive: it stays keyboard-accessible with the existing Button/FieldError primitives (§57, §59) and no dialog focus management is needed yet. It sits below the detail card — destructive actions render away from the page's primary actions. The button is `secondary` (marker accent stays reserved for primary actions, ADR-008). On success — and on `404 SET_NOT_FOUND` when the set was already deleted elsewhere — it navigates to `/dashboard`, which reflects the deletion via the server fetch; other failures keep the confirm step open with a clear error. `deleteSet` in `lib/api.ts` mirrors `updateSet`'s error mapping.

### Tests
- `pnpm --filter @danisolation-recall/web test` (60 tests, incl. 8 new: `deleteSet` sends DELETE with credentials, maps `SET_NOT_FOUND` and other failures to clear errors; the button requires confirmation before any API call, cancels back to a single control, deletes and navigates to `/dashboard`, navigates there on a 404, and shows an error on other failures; the detail page renders the delete control)
- `pnpm --filter @danisolation-recall/web typecheck` succeeds
- `pnpm --filter @danisolation-recall/web build` succeeds

---

### SET-014

### Title
Add the sets E2E journey

### Goal
Cover the full study-set lifecycle in a browser.

### Dependencies
SET-009
SET-010
SET-011
SET-012
SET-013

### Status
DONE

### Files
apps/web/e2e/sets.spec.ts

### Acceptance Criteria
- register → create a set → see it in the dashboard list → open detail → edit → delete → gone from the list

### Decision
One journey test (not per-feature tests): the phase's value is that the pieces compose, and the auth journey already covers the primitives they share. Registration runs through the UI (auto-signin), the set title doubles as the list/detail/heading assertion target, and deletion is asserted both by the missing list entry and the visible empty state. The E2E environment needed its Chromium build refreshed (`playwright install chromium`) — the lockfile's Playwright version had moved past the cached browser revision.

### Tests
- `pnpm --filter @danisolation-recall/web test:e2e` (5 Playwright tests, incl. the new sets journey: register through the UI → create with title/description → detail page renders → dashboard lists it → open detail → edit prefilled → save shows updated title on detail → delete with confirmation → dashboard shows the empty state with the set gone; the 4 auth tests still pass)
- `pnpm --filter @danisolation-recall/web test` (60 component tests) unaffected

---

## Cards phase

API design per §52: `GET/POST /sets/:id/cards`, `PATCH/DELETE /sets/:id/cards/:cardId`, plus reordering (§78 lists reorder as MVP). Every endpoint requires an authenticated session and is authorized through set ownership (§41): a card is reached only via its set, and a foreign set is indistinguishable from a missing row. Card input schemas live in `packages/contracts` (ADR-004). Deleting a set cascades its cards (SET-008 note). Learning state deliberately stays off the card (§45) — `UserCardProgress` arrives with the study-sessions phase.

### CARD-001

### Title
Add the cards table and migration

### Goal
Define the `cards` table in the database schema and generate its migration.

### Dependencies
None (builds on the existing `study_sets` table)

### Status
DONE

### Files
packages/database/src/schema.ts
packages/database/drizzle/0004_marvelous_makkari.sql
docs/database/schema.md

### Acceptance Criteria
- table has id, set_id (FK → study_sets, on delete cascade), front (not null), back (not null), position (not null), created_at, updated_at — following the existing serial/timezone conventions (§49)
- index on `set_id` for set-scoped queries; ordering supported by `position`
- the position-uniqueness tradeoff (plain index + repository-enforced ordering vs. unique constraint) is decided and recorded in the task
- migration is generated and applies cleanly
- schema documentation and the ER diagram are updated

### Decision
`position` is a **plain** column with a set-scoped btree index, not a unique `(set_id, position)` constraint: reordering a card shifts several sibling rows at once, and PostgreSQL checks unique constraints per row mid-statement, so a unique index would reject the very operation it exists to serve (unless declared deferrable, which drizzle-kit does not emit and which adds ceremony for a table with exactly one writer). Ordering integrity is owned by the cards repository (CARD-003), enforced inside transactions; gaps left by deletes are harmless. If a second writer ever appears, the upgrade path is a deferrable unique index.

### Tests
- `pnpm --filter @danisolation-recall/database db:generate` produced `drizzle/0004_marvelous_makkari.sql` (table, cascade FK, `cards_set_id_index`)
- `pnpm --filter @danisolation-recall/database db:migrate` applied it; `cards` verified in psql (columns, `ON DELETE CASCADE` FK, index)
- `pnpm --filter @danisolation-recall/database typecheck` and `build` succeed

---

### CARD-002

### Title
Add card input schemas to contracts

### Goal
Define Zod schemas for creating and updating a card.

### Dependencies
None

### Status
DONE

### Files
packages/contracts/src/card.schema.ts
packages/contracts/src/card.schema.spec.ts
packages/contracts/src/index.ts

### Acceptance Criteria
- `createCardSchema`: front and back required (trimmed, 1–2000 characters), with user-facing messages in the established register
- `updateCardSchema`: all fields optional, rejects an empty update — mirroring `updateSetSchema`
- inferred types (`CreateCardInput`, `UpdateCardInput`) exported
- the length ceilings chosen are recorded as a decision (changeable by migration later)

### Decision
Both sides share one `cardSide` factory (trim → pipe) parameterized by the empty-field message — "Enter the front" / "Enter the back" — so the two fields never drift and each gets its own error text. The 2000-character ceiling matches the set description's existing limit: far above real flashcard content, keeps request and future study-session payloads sane, and is changeable by migration if real usage demands more. `updateCardSchema` reuses `createCardSchema.partial()` with the same "Nothing to update" refine as `updateSetSchema`, so a cleared side still surfaces its "Enter the …" message rather than silently becoming no-change.

### Tests
- `pnpm --filter @danisolation-recall/contracts test` (35 tests, incl. 11 new: valid card, trimming both sides, empty front, whitespace-only back, over-length front/back, missing fields; front-only and back-only updates, trimmed update, empty update rejected)
- `pnpm --filter @danisolation-recall/contracts typecheck` succeeds

---

### CARD-003

### Title
Add card database access

### Goal
Provide a Drizzle repository for card persistence.

### Dependencies
CARD-001

### Status
DONE

### Files
apps/api/src/cards/cards.repository.ts
apps/api/src/cards/cards.repository.integration.spec.ts
packages/database/src/index.ts

### Acceptance Criteria
- repository supports create (append to a set's ordering), findById, listBySet (ordered by position), update, delete, and reordering
- every query is authorized through set ownership (§41): card lookups join through `study_sets` so a foreign owner's card is indistinguishable from a missing row
- listBySet is offset-paginated like the sets list (§36)

### Decision
Every card method takes `setId` alongside the card id and scopes through the `study_sets` join ( findById/update/delete) or verifies the set first (create/listBySet), so a foreign owner's card is indistinguishable from a missing row at the SQL level — matching the sets repository's rule. `create` and `move` run in transactions and own the ordering invariant from CARD-001: create appends `max(position)+1`, move clamps the target to `1..n`, shifts the siblings between the old and new place in one direction, then sets the card's position — the sequence stays dense. `listBySet` returns `null` for a foreign/missing set but an empty array for an owned empty set, so the controller can 404 the first and render an empty state for the second. `packages/database/src/index.ts` gained the `asc`/`gte`/`lte`/`lt` re-exports — apps still funnel all drizzle helpers through the database package.

### Tests
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` (105 tests, incl. 19 new repository integration tests: append ordering, foreign/unknown set rejected, find by id, foreign owner null, study-order listing, foreign cards excluded, foreign set list null, limit/offset pagination, partial update + `updated_at` bump, foreign update/delete rejected, move up/down, no-op move, out-of-range clamp, foreign move rejected)
- `pnpm --filter @danisolation-recall/api typecheck` succeeds
- `pnpm --filter @danisolation-recall/contracts build` and `pnpm --filter @danisolation-recall/database build` refreshed the dist consumed by the API (the typecheck initially failed on CARD-002 types until contracts was rebuilt — same dist gotcha documented in schema.md)

---

### CARD-004

### Title
Add create card endpoint (POST /sets/:id/cards)

### Goal
Allow the owner of a set to add a card to it.

### Dependencies
CARD-002
CARD-003

### Status
DONE

### Files
apps/api/src/cards/cards.module.ts
apps/api/src/cards/cards.controller.ts
apps/api/src/cards/create-card.service.ts
apps/api/src/cards/create-card.service.spec.ts
apps/api/src/cards/create-card.integration.spec.ts
apps/api/src/app.module.ts

### Acceptance Criteria
- authenticated users can add a card to their own set; the new card appends to the end of the ordering
- malformed or foreign set returns 404 (same rule as GET /sets/:id); invalid body returns 400 `VALIDATION_ERROR`
- 201 with an explicit response shape; 401 `UNAUTHENTICATED` without a session

### Decision
`CardsController` mounts at `sets/:id/cards` — the set id lives in the controller path, so every future card route (`GET/PATCH/DELETE`, reorder) shares one ownership-scoped prefix and the same local `parseSetId` malformed-id fold into 404 as the sets controller. The service stays HTTP-agnostic: it returns the card or `null`, and the controller translates `null` into 404 `SET_NOT_FOUND` — the same division as `SetsController.get` (HTTP errors live at the boundary). The ownership check is the repository's transactional set lookup, so ownership and position assignment land atomically. `CardsModule` imports `AuthModule` exactly like `SetsModule` so the guard's `SessionService` resolves.

### Tests
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` (114 tests, incl. 9 new: 2 service unit tests — passthrough and null-for-foreign-set contract; 7 HTTP-level tests — 201 with trimmed values and position 1, append to position 2, 401 `UNAUTHENTICATED`, 400 `VALIDATION_ERROR`, 404 `SET_NOT_FOUND` for unknown and malformed set ids, 404 for a foreign set left intact)
- `pnpm --filter @danisolation-recall/api typecheck` and `build` succeed

---

### CARD-005

### Title
Add list cards endpoint (GET /sets/:id/cards)

### Goal
Return a set's cards to its owner, in study order.

### Dependencies
CARD-003
CARD-004

### Status
DONE

### Files
apps/api/src/cards/cards.controller.ts
apps/api/src/cards/list-cards.integration.spec.ts

### Acceptance Criteria
- only the set owner's cards are returned, ordered by position (study order)
- explicit paginated envelope (items + next offset), same shape and limits as GET /sets
- 404 for a missing or foreign set

### Decision
The query schema is a file-local `listCardsQuerySchema` mirroring `listSetsQuerySchema` (limit default 20 capped at 100 with a 400 `VALIDATION_ERROR` for violations rather than silent clamping, offset ≥ 0) — still not promoted to contracts since the web constructs no queries. `listBySet`'s contract does the authorization: `null` (missing or foreign set) becomes 404 `SET_NOT_FOUND` via the controller's existing `parseSetId`/NotFound path, while an owned empty set returns a 200 with `items: []` for the eventual UI empty state (CARD-009). The envelope's `nextOffset` follows the sets rule (`offset + limit` on a full page, else `null`), and `PaginatedCards` is exported from the controller the way `PaginatedSets` is.

### Tests
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` (118 tests, incl. 4 new HTTP-level tests: envelope with position order and full row shape, limit/offset slicing with `nextOffset` transitions 2 → null, 404 `SET_NOT_FOUND` for a foreign set and an unknown id, 400 `VALIDATION_ERROR` for `limit=101` and `offset=-1`)
- `pnpm --filter @danisolation-recall/api typecheck` and `build` succeed

---

### CARD-006

### Title
Add update card endpoint (PATCH /sets/:id/cards/:cardId)

### Goal
Let the owner edit a card's front and back.

### Dependencies
CARD-005

### Status
DONE

### Files
apps/api/src/cards/cards.controller.ts
apps/api/src/cards/update-card.integration.spec.ts

### Acceptance Criteria
- owner-only partial update validated by `updateCardSchema`
- updated card returned with `updated_at` bumped
- 404 for missing card, foreign set, or malformed cardId; 400 for an empty update

### Decision
Every 404 on a card route — malformed cardId, unknown card, card in a missing or foreign set — folds into a single `CARD_NOT_FOUND`: the addressed resource is the card, and a foreign set is indistinguishable from a set without that card, which leaks nothing (§41, §111). `SET_NOT_FOUND` stays reserved for the set level of the path (`parseSetId`, shared with POST, reports a malformed set id) and for set-level routes. The repository's single exists-scoped `update` covers all four 404 shapes in one query — no set pre-check needed. The empty-update 400 is free: `updateCardSchema`'s "Nothing to update" refine flows through the global `ZodValidationPipe` as `VALIDATION_ERROR`.

### Tests
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` (124 tests, incl. 6 new HTTP-level tests: front-only with the back intact, back-only with the front intact, trimming on both, `updated_at` strictly bumped, 404 `CARD_NOT_FOUND` for an unknown card, an unknown set, a malformed cardId and a foreign set left intact, 400 `VALIDATION_ERROR` for an empty update)
- `pnpm --filter @danisolation-recall/api typecheck` and `build` succeed

---

### CARD-007

### Title
Add delete card endpoint (DELETE /sets/:id/cards/:cardId)

### Goal
Let the owner delete a card.

### Dependencies
CARD-006

### Status
DONE

### Files
apps/api/src/cards/cards.controller.ts
apps/api/src/cards/delete-card.integration.spec.ts

### Acceptance Criteria
- owner-only; 204 on success
- 404 for missing card, foreign set, or malformed cardId; repeat delete returns 404
- the gap left in the ordering is handled (decide and record: leave gaps vs. close them)

### Decision
Gaps are **left**, not closed — CARD-001's ordering decision already called gaps harmless, and this endpoint makes it official: `listBySet` sorts by `position`, so relative order is unaffected, and `move` shifts a position *range*, so it tolerates holes (verified by the HTTP test pinning the survivor's position). Closing gaps would cost a transaction and an extra UPDATE per delete for zero user-visible benefit. Upgrade path: close the gap transactionally in the repository if dense positions ever become a requirement. The 404 contract matches CARD-006 exactly: `CARD_NOT_FOUND` for malformed cardId, unknown card, foreign set (card left intact), and repeat deletes; `SET_NOT_FOUND` stays on malformed set ids via the shared `parseSetId`.

### Tests
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` (128 tests, incl. 4 new HTTP-level tests: 204 deleting the first of two cards with the survivor's position still 2 (the gap decision made observable) and the deleted id gone from the list, 404 `CARD_NOT_FOUND` for an unknown and a malformed card id, 404 for a foreign set's card left intact, 404 on a repeat delete)
- `pnpm --filter @danisolation-recall/api typecheck` and `build` succeed

---

### CARD-008

### Title
Add card reorder endpoint

### Goal
Let the owner change a card's position in the set's study order.

### Dependencies
CARD-007

### Status
DONE

### Files
apps/api/src/cards/cards.controller.ts
apps/api/src/cards/reorder-card.integration.spec.ts

### Acceptance Criteria
- owner-only; the exact contract (move-to-position vs. explicit id order) is decided and recorded here, informed by the UI's needs
- reordering keeps every card in the set with a stable, complete ordering
- 404/400 rules consistent with the other card endpoints

### Decision
**Move-to-position**: `PATCH /sets/:id/cards/:cardId/position` with `{ position: n }`, backed unchanged by the repository's transactional `move` (CARD-003). The MVP UI is move up/down buttons, not drag-and-drop (§81): the client knows the card's `position` from the list envelope and sends `position ± 1`, so an explicit id-order list would only add client state and a heavier validate-everything contract. Alternatives rejected: folding `position` into the content PATCH (would reshape `updateCardSchema`'s contract; zod strips unknown keys, so `{ position }` would become a 400 "Nothing to update"), and an RPC-style `/move` verb path. The position schema stays file-local like the list query schema (the web sends a computed number, no shared validation needed yet). Bounds: structurally invalid targets (missing, non-integer, < 1) → 400 `VALIDATION_ERROR`; out-of-range targets clamp to 1..n per CARD-003 — the UI always targets an adjacent slot, the clamp only absorbs stale positions. 404 rules match CARD-006/007 (`CARD_NOT_FOUND`; malformed set id stays `SET_NOT_FOUND`). The reorder is a single transaction with the sibling shift, so the ordering stays stable and complete.

### Tests
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` (133 tests, incl. 5 new HTTP-level tests: A moved 1→2 with siblings B, C shifted and the list order B, A, C; out-of-range target clamped to last with the full order updated; 400 `VALIDATION_ERROR` for `position: 0` and a missing position; 404 `CARD_NOT_FOUND` for an unknown and a malformed card id; 404 for a foreign set's card left in place)
- `pnpm --filter @danisolation-recall/api typecheck` and `build` succeed

---

### CARD-009

### Title
Add the cards list to the set detail page

### Goal
Show a set's cards on its detail page.

### Dependencies
CARD-005

### Status
DONE

### Files
apps/web/src/app/(protected)/sets/[id]/page.tsx
apps/web/src/app/(protected)/sets/[id]/page.spec.tsx
apps/web/src/components/card-list.tsx
apps/web/src/components/card-list.spec.tsx
apps/web/src/lib/cards.ts
apps/web/src/lib/cards.spec.ts

### Acceptance Criteria
- a server component fetches `GET /sets/:id/cards` with the forwarded cookie (same pattern as `listSets`)
- cards render front and back in study order
- the empty state offers adding the first card (§56)

### Decision
The server fetch landed in a new `lib/cards.ts` rather than growing `lib/sets.ts`: cards are their own domain (mirroring the API's module split), and the cookie-forwarding, `no-store` pattern is copied per function by established convention. `CardList` is presentational with no client JS — items render front (medium) over back (soft) in list order, which *is* study order; positions are not displayed because CARD-007 leaves gaps after deletes and a raw `position` column could read 1, 2, 4. The empty state is the §56 offer as text ("No cards yet. Add your first card to start studying.") without a control — the create-card form it will sit beside arrives in CARD-010, so a dead link is deferred rather than rendered (SET-009 precedent of forward references completing in the next task). The section sits above the destructive delete control (SET-013), with the "Cards" heading kept in the page (SET-010). API failure surfaces through Next's error boundary, same as the dashboard list.

### Tests
- `pnpm --filter @danisolation-recall/web test` (67 tests, incl. 7 new: `listCards` forwards the cookie to `/sets/:id/cards`, returns an empty page without a cookie without calling the API, throws on API failure; `CardList` renders fronts/backs in order and offers the first card when empty; the page renders the "Cards" section with ordered items and the empty-state offer)
- `pnpm --filter @danisolation-recall/web typecheck` and `build` succeed (`/sets/[id]` stays dynamic)

---

### CARD-010

### Title
Add the create card form

### Goal
Let the owner add a card from the set detail page.

### Dependencies
CARD-004
CARD-009

### Status
DONE

### Files
apps/web/src/app/(protected)/sets/[id]/page.tsx
apps/web/src/app/(protected)/sets/[id]/page.spec.tsx
apps/web/src/app/(protected)/sets/[id]/create-card-form.tsx
apps/web/src/app/(protected)/sets/[id]/create-card-form.spec.tsx
apps/web/src/lib/api.ts

### Acceptance Criteria
- form validates with `createCardSchema` via `zodResolver`
- success appends the card to the visible list (§25: refetch/refresh the stale list)
- API errors show clear messages (§56)

### Decision
The form stays on the page after success — flashcard authoring is a repeat action — so instead of SET-009's navigate-to-detail it clears the fields and calls `router.refresh()`: the card list is a server component, and refreshing re-runs its `listCards` fetch, which is the only stale cache (§25 — no client cache exists to invalidate, so TanStack Query is still unjustified). No optimistic insert; the refetch is authoritative and shows the server-assigned position. `createCard` returns `void` because the client needs nothing from the response, and maps `404 SET_NOT_FOUND` (set deleted in another tab) to "This set no longer exists." with everything else generic. The form sits in the panel register directly under the "Cards" heading, above the list, turning CARD-009's text-only empty state into a real offer. `page.tsx`/`page.spec.tsx` were touched beyond the original file list because the page is the form's only reachable mount point (SET-009 precedent).

### Tests
- `pnpm --filter @danisolation-recall/web test` (72 tests, incl. 5 new: the form renders Front/Back fields with an "Add card" submit; an empty submit shows both "Enter the front" and "Enter the back" without calling the API; success calls `createCard(setId, values)`, clears both fields, and triggers the refresh; an API failure shows the message and keeps the typed values; the detail page renders the form)
- `pnpm --filter @danisolation-recall/web typecheck` and `build` succeed

---

### CARD-011

### Title
Add card editing

### Goal
Let the owner edit a card's front and back.

### Dependencies
CARD-006
CARD-009

### Status
DONE

### Files
apps/web/src/app/(protected)/sets/[id]/page.tsx
apps/web/src/app/(protected)/sets/[id]/page.spec.tsx
apps/web/src/app/(protected)/sets/[id]/edit-card-form.tsx
apps/web/src/app/(protected)/sets/[id]/edit-card-form.spec.tsx
apps/web/src/components/card-list.tsx
apps/web/src/components/card-list.spec.tsx
apps/web/src/lib/api.ts

### Acceptance Criteria
- form is prefilled and validated with `updateCardSchema`
- success re-renders the updated card
- API errors show clear messages (§56)

### Decision
Edit state lives in the URL (`?edit=<cardId>`) — §23's URL state, the one category for "which item am I editing". `CardList` stays a server component (CARD-009's decision preserved) and each item gains an "Edit" text link; the page resolves the param against the fetched cards and swaps the create form for a prefilled `EditCardForm`, so labeled fields stay unique and there is exactly one client form per mode. A param matching no card is silently ignored (stale links degrade to the normal view, no error state needed for UI-only state). Unlike CARD-010's stay-in-place create, saving or cancelling changes the URL (`router.push` back to `/sets/:id`), and the navigation itself re-renders the server components with fresh data — no explicit `refresh()` (§25: the URL change is the invalidation). The form always sends both prefilled sides — the same full-update reading of `updateCardSchema.partial()` as SET-012, so a cleared field surfaces its "Enter the …" message instead of a silent no-change. `updateCard` maps `404 CARD_NOT_FOUND` to "This card no longer exists." (card deleted in another tab).

### Tests
- `pnpm --filter @danisolation-recall/web test` (80 tests, incl. 8 new: the form renders prefilled with Save changes and Cancel; an empty front blocks submission without calling the API; saving calls `updateCard(setId, cardId, values)` and navigates to `/sets/:id`; an API failure shows the message and keeps the values; Cancel navigates without calling the API; every card links to `?edit=<id>`; the page renders the prefilled edit form — create form hidden — for a matching param and no form for a stale param)
- `pnpm --filter @danisolation-recall/web typecheck` and `build` succeed (`/sets/[id]` stays dynamic)

---

### CARD-012

### Title
Add card deletion

### Goal
Let the owner delete a card.

### Dependencies
CARD-007
CARD-009

### Status
DONE

### Files
apps/web/src/components/card-list.tsx
apps/web/src/components/card-list.spec.tsx
apps/web/src/app/(protected)/sets/[id]/delete-card-button.tsx
apps/web/src/app/(protected)/sets/[id]/delete-card-button.spec.tsx
apps/web/src/lib/api.ts
apps/web/src/lib/api.spec.ts

### Acceptance Criteria
- a per-card delete control asks for confirmation before deleting (same inline pattern as SET-013)
- success removes the card from the visible list
- a 404 after the card is gone is handled

### Decision
`DeleteCardButton` mirrors SET-013's two-step inline confirmation, scaled to a per-card control rendered inside each `CardList` item next to its "Edit" link (trigger styled as the same text link, confirm step swaps in place with the secondary Buttons). The one behavioral difference from the set version: the page stays valid after deletion, so success — and a `404 CARD_NOT_FOUND` from a card already deleted elsewhere, where the intent is achieved either way — calls `router.refresh()` instead of navigating; the server refetch drops the card from the list. If the deleted card was in edit mode, the stale `?edit` param simply matches no card and the page falls back to the create form (CARD-011's ignore rule). Other failures keep the confirm step open with an error. `deleteCard` maps `CARD_NOT_FOUND` to "This card no longer exists." and is unit-tested like `deleteSet` (SET-013 precedent).

### Tests
- `pnpm --filter @danisolation-recall/web test` (89 tests, incl. 9 new: the button requires confirmation and cancels back to one control; success calls `deleteCard(setId, cardId)` and refreshes; a `CARD_NOT_FOUND` 404 refreshes without an error; other failures show the error and don't refresh; every card offers a Delete control; `deleteCard` sends DELETE with credentials and maps the 404 and generic failures)
- `pnpm --filter @danisolation-recall/web typecheck` and `build` succeed

---

### CARD-013

### Title
Add card reordering

### Goal
Let the owner reorder a set's cards.

### Dependencies
CARD-008
CARD-009

### Status
DONE

### Files
apps/web/src/components/card-list.tsx
apps/web/src/components/card-list.spec.tsx
apps/web/src/app/(protected)/sets/[id]/move-card-button.tsx
apps/web/src/app/(protected)/sets/[id]/move-card-button.spec.tsx
apps/web/src/lib/api.ts
apps/web/src/lib/api.spec.ts

### Acceptance Criteria
- each card offers move up/down (keyboard-accessible; no drag-and-drop library — §81), matching the reorder contract chosen in CARD-008
- boundary cards have their move control disabled
- success re-renders the new order

### Decision
Each card gets plain "Move up" / "Move down" text buttons in its action row (keyboard-accessible by nature; no drag-and-drop dependency, §81). The move target is the **neighbouring card's position**, not `position ± 1` — CARD-007 leaves gaps after deletes, and the reorder contract (CARD-008) needs a real position to swap past the neighbour; using the neighbour's stored position is correct in both dense and gapped orderings. A boundary card's control is disabled because it *has no neighbour* — the absence is the boundary, which also satisfies the strict-index type rule without assertions (an inert fallback target keeps the props total while disabled). Success — and a `404 CARD_NOT_FOUND` from a card deleted elsewhere — calls `router.refresh()`: the URL is unchanged, so the server refetch is the only invalidation (§25), and the returned order is authoritative. Other failures show an error under the control without refreshing. `moveCard` maps `CARD_NOT_FOUND` to "This card no longer exists." and is unit-tested like `deleteCard`.

### Tests
- `pnpm --filter @danisolation-recall/web test` (98 tests, incl. 9 new: the button renders its direction and moves to the target position with a refresh; a disabled control never calls the API; a `CARD_NOT_FOUND` 404 refreshes without an error; other failures show the error and don't refresh; with two cards the first card's "Move up" and the last card's "Move down" are disabled while the opposite directions stay enabled; `moveCard` patches `/position` with the position body and maps the 404 and generic failures)
- `pnpm --filter @danisolation-recall/web typecheck` and `build` succeed

---

### CARD-014

### Title
Add the cards E2E journey

### Goal
Cover the card lifecycle in a browser inside a real set.

### Dependencies
CARD-010
CARD-011
CARD-012
CARD-013

### Status
DONE

### Files
apps/web/e2e/cards.spec.ts

### Acceptance Criteria
- register → create a set → add cards → see them on the detail page in order → edit one → move one → delete one → delete the set (cards cascade)

### Decision
One journey test, not per-feature tests (SET-014 precedent): the phase's value is that the pieces compose — the create form's `router.refresh()`, the URL-driven edit state, and the per-card move/delete controls all land on the same server-rendered list. Distinct card texts ("Capital of France/Japan/Peru") avoid substring collisions when asserting visibility; order assertions use `toHaveText` with an array of plain RegExps (the documented matcher form — `expect.stringMatching` silently never matches in array mode). Every list-level interaction is scoped through `getByRole("listitem").filter({ hasText: ... })` so multi-card controls stay unambiguous. The set deletion at the end exercises the cascade and lands on the dashboard's empty state.

### Tests
- `pnpm --filter @danisolation-recall/web test:e2e` (6 Playwright tests, incl. the new cards journey: register through the UI → create the host set → add three cards in order → edit the second card via `?edit=` with the create form yielding → move the third card up with the order asserted → delete a card with confirmation → delete the set and see the dashboard empty state; the 4 auth tests and the sets journey still pass)
- `pnpm --filter @danisolation-recall/web test` (98 component tests) unaffected

---

## Study sessions phase

MVP study flow per §78: start a session for one of your sets, display cards one at a time, reveal the answer, answer the card, finish the session. Reviews are historical events — inserted once, never updated (§44, §46); per-card learning state is `UserCardProgress` (§45), written at review time so the later Progress phase only has to surface it. The domain distinctions that must not drift (§44): a StudySession is an interaction, a StudySet is content, a Card is content, a Review is history. API design per §52: `POST /study-sessions`, `GET /study-sessions/:id`, `POST /study-sessions/:id/reviews`, plus a finish transition. Sessions belong to their user directly (owner filter on `user_id`); the studied set is reached through ownership the same way cards are (§41). The session lifecycle, MVP study mode, answer model, and how `next_review_at` is produced are decided once in STUDY-001 (ADR-009) before any table exists — later tasks inherit those decisions rather than re-deciding them.

### STUDY-001

### Title
Record the study session design decision (ADR-009)

### Goal
Decide and document the session lifecycle, MVP study mode, review model, and scheduling approach before any study-session table or endpoint exists.

### Dependencies
None (builds on the completed cards phase)

### Status
DONE

### Files
docs/adr/ADR-009-study-sessions.md

### Acceptance Criteria
- ADR covers context, decision, alternatives, why, tradeoffs, consequences (§74)
- decides the session states for MVP (a subset of §47's CREATED/ACTIVE/PAUSED/COMPLETED/ABANDONED) and the allowed transitions
- decides the MVP study mode: an ordered pass through the set's cards in position order (no per-session randomization yet — §50 notes how to add a testable random source later)
- decides the answer model (binary correct/incorrect vs. a graded rating) and how `UserCardProgress.next_review_at` is produced — a minimal interval rule with the FSRS upgrade path recorded (§48: prefer an established scheduler rather than an invented one; the MVP decision must state which rule is used and why it is honest for MVP)
- decides whether a session snapshots its cards at start or reads live card order, and what deleting a set does to its sessions (cascade vs. retain — record the history-loss tradeoff, §46)
- the decisions are compatible with STUDY-002..014 and leave the Progress phase able to surface review count, accuracy, and next review without schema churn

### Decision
ADR-009 records: `ACTIVE → COMPLETED | ABANDONED` with terminal states accepting nothing (no `CREATED` — creation is activation; `PAUSED` deferred until a pause feature exists); one MVP mode — an ordered pass over the set's **live** position order, with the session payloads carrying the ordered cards so start and resume are each a single fetch; binary `correct: boolean` answers matching the two-control UI (a graded column can be added to the append-only table later); a Leitner-style ladder behind an isolated pure `schedule(progress, correct, now)` — streak 0 → 10 minutes, then 1 → 3 → 7 days capped, incorrect resets the streak — with FSRS recorded as the same-signature upgrade path (§48); one review per card per session (409 `REVIEW_ALREADY_RECORDED`), idempotent repeat-finish (409 `INVALID_STUDY_SESSION` only from `ABANDONED`), 404 `SESSION_NOT_FOUND` for missing/foreign sessions; and full cascade on set deletion — losing history with the content is the deliberate, recorded tradeoff (§46).

### Tests
None (documentation only)

---

### STUDY-002

### Title
Add the study_sessions table and migration

### Goal
Define the `study_sessions` table in the database schema and generate its migration.

### Dependencies
STUDY-001

### Status
DONE

### Files
packages/database/src/schema.ts
packages/database/drizzle/0005_material_gamma_corps.sql
docs/database/schema.md

### Acceptance Criteria
- table has id, user_id (FK → users, on delete cascade), set_id (FK → study_sets, per ADR-009's deletion decision), status (not null), started_at, finished_at (nullable), created_at, updated_at — following the existing serial/timezone conventions (§49)
- index on `user_id` for history and progress queries
- migration is generated and applies cleanly; schema documentation and the ER diagram are updated

### Decision
`status` is plain text carrying ADR-009's state tokens (`ACTIVE`, `COMPLETED`, `ABANDONED`) verbatim — no pgEnum and no check constraint: a domain enum constrains the value set but not the transitions, and the state machine is owned by the study repository as the single writer, exactly the tradeoff CARD-001 made for `position`. Storing the ADR's tokens verbatim means no mapping layer between the documented state machine, the column, and the API contract. `started_at` is kept alongside `created_at` per the task spec (identical at creation in MVP; `started_at` is the domain fact, `created_at` the row fact). Only the `user_id` index is added — the Progress phase reads by user; `set_id` needs no index until something queries sessions by set.

### Tests
- `pnpm --filter @danisolation-recall/database db:generate` produced `drizzle/0005_material_gamma_corps.sql` (table, cascade FKs, `study_sessions_user_id_index`)
- `pnpm --filter @danisolation-recall/database db:migrate` applied it; `study_sessions` verified in psql (columns, both `ON DELETE CASCADE` FKs, index)
- `pnpm --filter @danisolation-recall/database typecheck` and `build` succeed (dist refreshed for the API)

---

### STUDY-003

### Title
Add the reviews table and migration

### Goal
Define the `reviews` table — the historical record of answered cards (§44, §46).

### Dependencies
STUDY-002

### Status
DONE

### Files
packages/database/src/schema.ts
packages/database/drizzle/0006_large_klaw.sql
docs/database/schema.md

### Acceptance Criteria
- table has id, session_id (FK → study_sessions cascade), card_id (FK → cards cascade), correct (boolean, per ADR-009's binary answer model), reviewed_at — reviews are inserted once and never updated
- index on `session_id` for session history; `card_id` indexed for the Progress phase's per-card joins
- migration is generated and applies cleanly

### Decision
The acceptance criteria gained one constraint beyond the two indexes: a unique `(session_id, card_id)` — ADR-009's one-review-per-card-per-session rule (409 `REVIEW_ALREADY_RECORDED`) must survive a double-submit race, and check-then-insert inside the transaction cannot guarantee that; the constraint is the same DB-level guarantee STUDY-004 gives progress with its `(user_id, card_id)` unique (§32). The repository's job shrinks to translating the violation into the 409. `reviewed_at` doubles as the row's creation timestamp — reviews are insert-only history, so a separate `created_at` would be a permanent duplicate of the same fact (§46).

### Tests
- `pnpm --filter @danisolation-recall/database db:generate` produced `drizzle/0006_large_klaw.sql` (table, cascade FKs, both indexes, the unique constraint)
- `pnpm --filter @danisolation-recall/database db:migrate` applied it; `reviews` verified in psql (columns, both `ON DELETE CASCADE` FKs, indexes, unique constraint)
- `pnpm --filter @danisolation-recall/database typecheck` and `build` succeed (dist refreshed for the API)

---

### STUDY-004

### Title
Add the user_card_progress table and migration

### Goal
Define `user_card_progress` — the current learning state of a user's card (§45), distinct from review history.

### Dependencies
STUDY-002

### Status
DONE

### Files
packages/database/src/schema.ts
packages/database/drizzle/0007_secret_sabra.sql
docs/database/schema.md

### Acceptance Criteria
- table has id, user_id (FK → users cascade), card_id (FK → cards cascade), review_count, correct_count, streak (consecutive correct answers — the scheduling state ADR-009's ladder reads), last_reviewed_at, next_review_at (nullable until first review), created_at, updated_at
- unique constraint on (user_id, card_id) — one progress row per user per card, the invariant the review endpoint's upsert relies on
- migration is generated and applies cleanly

### Decision
Counts default to `0` and the two review timestamps are nullable: the row is created by the review endpoint's upsert on first review, and the defaults make the insert legible (no magic constants at the call site) while `null` timestamps honestly represent "never reviewed" for a provisioned-but-unstudied row. `streak` is the ladder's only scheduling state — the ADR's interval is derived from it, not stored. No separate by-user index: the unique constraint's index leads on `user_id`, covering the Progress phase's by-user reads for free.

### Tests
- `pnpm --filter @danisolation-recall/database db:generate` produced `drizzle/0007_secret_sabra.sql` (table, cascade FKs, the unique constraint)
- `pnpm --filter @danisolation-recall/database db:migrate` applied it; `user_card_progress` verified in psql (columns with defaults, both `ON DELETE CASCADE` FKs, unique constraint)
- `pnpm --filter @danisolation-recall/database typecheck` and `build` succeed (dist refreshed for the API)

---

### STUDY-005

### Title
Add study session input schemas to contracts

### Goal
Define Zod schemas for starting a session, recording a review, and the session response contract.

### Dependencies
STUDY-001

### Status
DONE

### Files
packages/contracts/src/study-session.schema.ts
packages/contracts/src/study-session.schema.spec.ts
packages/contracts/src/index.ts

### Acceptance Criteria
- `startSessionSchema`: `setId` required (positive integer) with user-facing messages
- `reviewSchema`: card id and rating per ADR-009's answer model
- inferred types (`StartSessionInput`, `ReviewInput`) exported
- user-facing messages in the established register (sentence case, no trailing period)

### Decision
`reviewSchema` carries `{ cardId, correct }` — the boolean *is* the "rating" ADR-009's binary answer model decided, named to match the `reviews.correct` column so no representation drifts (§82). The ids are strict numbers, not coerced: JSON bodies send real numbers, and coercing would silently accept `"42"` strings that only exist in hand-built requests (unlike the query-param schemas, where strings are the transport's native type). Both fields use one message each in the register ("Choose a set to study" / "Choose a card to answer" / "Record your answer") — zod v4's `error` param covers the type, int, and positivity violations alike. No response schema: the response shapes live in ADR-009 and the web's lib types (the same split SET-005 kept query schemas file-local), and the web constructs no session requests it needs to validate client-side yet.

### Tests
- `pnpm --filter @danisolation-recall/contracts test` (45 tests, incl. 10 new: valid start and review, missing/non-integer/zero/negative ids, the message register asserted on the type violation, missing and non-boolean answers)
- `pnpm --filter @danisolation-recall/contracts typecheck` succeeds; `build` refreshed the dist the API consumes

---

### STUDY-006

### Title
Add study session database access

### Goal
Provide a Drizzle repository for sessions, reviews, and progress.

### Dependencies
STUDY-002
STUDY-003
STUDY-004

### Status
DONE

### Files
apps/api/src/study/sessions.repository.ts
apps/api/src/study/sessions.repository.integration.spec.ts
apps/api/src/study/schedule.ts
apps/api/src/study/schedule.spec.ts
packages/database/src/index.ts (no changes needed — `export * from "./schema"` already carried the new tables)

### Acceptance Criteria
- repository supports: create (verifying the set is owned by the caller — a foreign set is indistinguishable from missing, §41), findById (owner-scoped), listByUser (offset-paginated, newest first, §36), complete/abandon status transitions per ADR-009, addReview, listReviewsBySession (chronological), and the progress upsert (insert-or-update review_count/correct_count/last_reviewed_at/next_review_at per ADR-009's minimal rule)
- the progress upsert relies on the (user_id, card_id) unique constraint (STUDY-004)
- every query is owner-scoped (§41)

### Decision
The scheduler from ADR-009 lives in its own pure module (`study/schedule.ts`, unit-tested with an explicit `now`, §49) — the ledger's file list gained it because the upsert cannot implement ADR-009's rule without it, and isolation is what keeps FSRS a body swap (§48). `addReview` is the transactional composition the acceptance implies rather than a bare insert: it verifies the session (owned, `ACTIVE`) and the card's membership in the session's set, inserts the review, and upserts progress (`onConflictDoUpdate` with SQL increments and the ladder's next state) atomically — a review without its progress update is unrepresentable (§34). Duplicate detection translates the `(session_id, card_id)` unique violation into the `duplicate` outcome; the one implementation wrinkle is that drizzle 0.45 wraps driver errors, so the pg `23505` code is read off `error.cause` when not on the error itself. Transitions return a discriminated result (`transitioned` / `unchanged` / `conflict` / `notFound`) so the endpoint can honor ADR-009's idempotent repeat-finish while still 409-ing the other terminal state; `listSessionCards` was added (again slightly beyond the list) because STUDY-007/008's payload contract needs the set's ordered cards through session ownership, and the study module querying the cards table directly matches the established cross-table repository style. `listReviewsBySession` returns `[]` for a foreign caller (scoped join) — the endpoint 404s via `findById` before it ever lists.

### Tests
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` (156 tests, incl. 23 new: 5 scheduler unit tests — incorrect resets to 10 minutes, correct walks 1 → 3 → 7 days capped, input untouched; 18 repository integration tests — ACTIVE creation, foreign/unknown set rejected, owner-scoped findById, newest-first pagination, complete/abandon transitions with unchanged no-op and conflict, first-review progress insert, insert-then-update math across sessions, incorrect reset, duplicate review, card-outside-set rejection, non-ACTIVE rejection, foreign/unknown 404s, chronological owner-only review listing, position-ordered session cards)
- `pnpm --filter @danisolation-recall/api typecheck` and `build` succeed

---

### STUDY-007

### Title
Add the start session endpoint (POST /study-sessions)

### Goal
Let an authenticated user start a study session for one of their sets.

### Dependencies
STUDY-005
STUDY-006

### Status
DONE

### Files
apps/api/src/study/sessions.module.ts
apps/api/src/study/sessions.controller.ts
apps/api/src/study/start-session.service.ts
apps/api/src/study/start-session.service.spec.ts
apps/api/src/study/start-session.integration.spec.ts
apps/api/src/app.module.ts

### Acceptance Criteria
- authenticated users can start a session for their own set; malformed or foreign set returns 404 (same rule as the cards phase)
- 201 with an explicit response shape per ADR-009 (what the client needs to display the first card without extra round trips); 401 `UNAUTHENTICATED` without a session
- invalid body returns 400 `VALIDATION_ERROR` via the global pipe

### Decision
The response is `{ session, cards }` — ADR-009's session-plus-ordered-cards payload under explicit keys, mirroring how STUDY-008 will add `reviews` beside them, so the study screen renders its first card from this one response. `StartSessionService` composes the repository's existing `create` (owner-checked, ACTIVE) with `listSessionCards` (owner-scoped position order) — no new SQL, both queries already belong to the study module; the card lookup cannot miss after a successful create, so its null branch is a type-satisfying fallback. A null from `create` — unknown or foreign `setId`, indistinguishable per §41 — is translated by the controller into 404 `SET_NOT_FOUND`, the same code the cards phase uses when the set in the path is missing or foreign (CARD-004); a malformed `setId` needs no path parsing here because it arrives as a validated JSON number (`startSessionSchema` rejects non-integers with 400). `SessionsController` mounts at `study-sessions` with `AuthGuard`, and `SessionsModule` imports `AuthModule` exactly like `SetsModule`/`CardsModule` so the guard's `SessionService` resolves.

### Tests
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` (162 tests, incl. 6 new: 2 service unit tests — session plus ordered cards returned, null without touching cards for a foreign/unknown set; 4 HTTP-level tests — 201 with `session` (ACTIVE, ownership, `finishedAt` null) and position-ordered cards with front/back, 401 `UNAUTHENTICATED`, 400 `VALIDATION_ERROR` for a non-integer `setId`, 404 `SET_NOT_FOUND` for an unknown and a foreign set left intact)
- `pnpm --filter @danisolation-recall/api typecheck` and `build` succeed

---

### STUDY-008

### Title
Add the get session endpoint (GET /study-sessions/:id)

### Goal
Return a session with its reviews so the study screen can render and resume.

### Dependencies
STUDY-007

### Status
DONE

### Files
apps/api/src/study/sessions.controller.ts
apps/api/src/study/get-session.integration.spec.ts

### Acceptance Criteria
- owner receives 200 with the session and its reviews chronologically
- missing or foreign session returns 404 with a stable error code (chosen from the §54 register and recorded in the task)
- malformed ids fold into the 404 like every other id route

### Decision
The error code is `SESSION_NOT_FOUND` — ADR-009 fixed it in advance ("404 `SESSION_NOT_FOUND` for a missing or foreign session, indistinguishable, §41"), so this task only records it. The payload is `{ session, reviews, cards }` per ADR-009's resume-is-one-fetch rule: the session from the owner-scoped `findById`, its chronological reviews from `listReviewsBySession`, and the set's current ordered cards from `listSessionCards` — the same card list the start payload carries, so the study screen and its completion view read identical shapes. The controller composes the repository directly (no service — the SET-006 precedent for reads; STUDY-007's service exists because start composes with a create decision, this route is three queries and a 404 translation); reviews and cards are fetched with `Promise.all` since neither depends on the other. `parseSessionId` folds a malformed id into the same 404, mirroring `parseSetId`. GET imposes no status filter — terminal sessions stay readable (the state machine only rejects transitions and reviews), which the completion view (STUDY-013) depends on; a test pins it.

### Tests
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` (166 tests, incl. 4 new HTTP-level tests: 200 with the session, reviews in recorded order with their `correct` flags, and position-ordered cards; 200 for a `COMPLETED` session with `finished_at` set — GET does not filter by status; 404 `SESSION_NOT_FOUND` for a foreign session and an unknown id; 404 `SESSION_NOT_FOUND` for a malformed id)
- `pnpm --filter @danisolation-recall/api typecheck` and `build` succeed

---

### STUDY-009

### Title
Add the record review endpoint (POST /study-sessions/:id/reviews)

### Goal
Record an answered card and update the user's progress in one transaction (§34).

### Dependencies
STUDY-008

### Status
DONE

### Files
apps/api/src/study/sessions.controller.ts
apps/api/src/study/record-review.service.ts
apps/api/src/study/record-review.service.spec.ts
apps/api/src/study/record-review.integration.spec.ts
apps/api/src/study/sessions.module.ts

### Acceptance Criteria
- owner-only; the reviewed card must belong to the studied set; the session must accept reviews per ADR-009's state machine
- review insert + progress upsert are atomic — a partial write must be impossible
- duplicate review of the same card within a session is decided and recorded (§54's `REVIEW_ALREADY_RECORDED` exists for exactly this; §55: design the retry behavior explicitly, never assume retry is safe)
- foreign/missing session or card returns 404; invalid body returns 400

### Decision
The route returns **201 with the review row** — the endpoint's product is the historical event (§46); progress is not in the response because the MVP study screen only needs the confirmation to advance, and the progress write is verified against the database (the integration tests read `user_card_progress` directly, proving the transaction rather than trusting a payload). `RecordReviewService` is deliberately thin: it supplies `new Date()` once at the application boundary — the single `now` the review, the progress upsert, and the scheduler share (§49) — and passes ADR-009's outcomes through for the controller to translate: `duplicate` → 409 `REVIEW_ALREADY_RECORDED`, `sessionNotActive` → 409 `INVALID_STUDY_SESSION`, `cardNotInSet` → 404 `CARD_NOT_FOUND` (a card outside the session's set is unaddressable from this route, the same fold CARD-006 made), `notFound` → 404 `SESSION_NOT_FOUND`. Atomicity and the state machine were already owned by the repository's transaction and STUDY-006's `(session_id, card_id)` unique constraint — this task adds no new invariants, only the boundary. Duplicate retries are **not** absorbed silently (ADR-009 §55): the client sees the 409; "study again" means a new session.

### Tests
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` (176 tests, incl. 10 new: 2 service unit tests — the review plus one explicit `now` passed through and the recorded result returned, failure outcomes passed through unchanged; 8 HTTP-level tests — 201 correct review with progress verified in the DB (counts, streak 1, `next_review_at` exactly +1 day, `last_reviewed_at` = `reviewed_at`), 201 incorrect review (streak 0, `next_review_at` exactly +10 minutes), 409 `REVIEW_ALREADY_RECORDED` on a repeat answer, 409 `INVALID_STUDY_SESSION` on a completed session, 404 `CARD_NOT_FOUND` for a card in another of the user's sets and an unknown card, 404 `SESSION_NOT_FOUND` for a foreign and an unknown session, 400 `VALIDATION_ERROR` for a missing `correct`, 401 `UNAUTHENTICATED`)
- `pnpm --filter @danisolation-recall/api typecheck` and `build` succeed

---

### STUDY-010

### Title
Add the finish session endpoint (POST /study-sessions/:id/finish)

### Goal
Let the owner complete or abandon the session per ADR-009's state machine.

### Dependencies
STUDY-008

### Status
DONE

### Files
apps/api/src/study/sessions.controller.ts
apps/api/src/study/finish-session.integration.spec.ts

### Acceptance Criteria
- owner-only; transitions per ADR-009 with `finished_at` set
- finishing an already-finished session is decided and recorded (idempotent no-op vs. error)
- foreign/missing session returns 404

### Decision
ADR-009 pre-decided the semantics — repeat-finish is an **idempotent no-op success** (safe retries), the other terminal state is 409 `INVALID_STUDY_SESSION`, and missing/foreign sessions are 404 `SESSION_NOT_FOUND` — so this task is pure boundary. The transitions ship as **two action routes**: `POST /study-sessions/:id/finish` (→ `COMPLETED`) and `POST /study-sessions/:id/abandon` (→ `ABANDONED`), one per state-machine transition, each delegating to the repository's `complete`/`abandon` through a single private translator for the shared `TransitionResult` → status mapping. No request body: the action is the URL, so there is nothing to validate and no 400 path (a body-enum DTO would only re-route between two endpoints). Both return **200 with the session row** (`finished_at` included for the completion view, STUDY-013) — `@HttpCode(200)` explicitly, because Nest's `@Post()` default of 201 is resource-creation semantics a transition doesn't have; the integration tests caught exactly this on the first run. Malformed ids fold into the 404 via the shared `parseSessionId`.

### Tests
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` (183 tests, incl. 7 new HTTP-level tests: 200 finish with `status`/`finished_at` set, 200 idempotent repeat-finish with the identical `finished_at` (no second write), 200 abandon with `finished_at` set, 409 `INVALID_STUDY_SESSION` finishing an abandoned session, 409 abandoning a completed session, 404 `SESSION_NOT_FOUND` for a foreign, unknown, and malformed id, 401 `UNAUTHENTICATED`)
- `pnpm --filter @danisolation-recall/api typecheck` and `build` succeed

---

### STUDY-011

### Title
Add the start-study control and study route

### Goal
Let the owner start studying a set from its detail page.

### Dependencies
STUDY-007
CARD-009

### Status
DONE

### Files
apps/web/src/app/(protected)/sets/[id]/start-study-button.tsx
apps/web/src/app/(protected)/sets/[id]/start-study-button.spec.tsx
apps/web/src/app/(protected)/sets/[id]/page.tsx
apps/web/src/app/(protected)/sets/[id]/page.spec.tsx
apps/web/src/lib/api.ts
apps/web/src/app/(protected)/study/[sessionId]/page.tsx

### Acceptance Criteria
- the set detail page offers a primary "Study" control (marker accent per ADR-008 — studying is the product's primary action)
- starting navigates to the study screen for the new session
- API errors show clear messages (§56)

### Decision
`StartStudyButton` is the first control to use the Button's default `primary` variant — ADR-008 reserved the marker accent for primary actions, and studying is the product's primary action; it sits in the detail page's header row beside the neutral "Edit set" text link. It mirrors the LogoutButton shape (pending state, FieldError) and navigates to `/study/<session.id>` on success, where the only thing the client consumes from the 201 payload is the session id (SET-009 precedent: the response's cards are for the screen that renders them, not the navigation). `startSession` in `lib/api.ts` parses the `{ session: { id } }` envelope and maps `404 SET_NOT_FOUND` to "This set no longer exists." with everything else generic — the button displays the `ApiError` message it receives. The study route ships as a protected server-component shell (`(protected)/study/[sessionId]/page.tsx`) that folds malformed ids into `notFound()` (SET-011 precedent) and renders the session id; STUDY-012 replaces its body with the card-by-card interaction, so the navigation target is real from day one.

### Tests
- `pnpm --filter @danisolation-recall/web test` (102 tests, incl. 4 new: the button calls `startSession({ setId })` and pushes `/study/7`, a `SET_NOT_FOUND` failure shows "This set no longer exists." without navigating and re-enables the control, an unexpected failure shows the generic message; the detail page renders the "Study" control)
- `pnpm --filter @danisolation-recall/web typecheck` and `build` succeed (`/study/[sessionId]` is dynamic under the protected layout)

---

### STUDY-012

### Title
Add the study session screen

### Goal
The card-by-card study interaction: display front, reveal back, answer (§78).

### Dependencies
STUDY-008
STUDY-009
STUDY-011

### Status
DONE

### Files
apps/web/src/app/(protected)/study/[sessionId]/study-client.tsx
apps/web/src/app/(protected)/study/[sessionId]/study-client.spec.tsx
apps/web/src/app/(protected)/study/[sessionId]/page.tsx
apps/web/src/lib/api.ts

### Acceptance Criteria
- shows the current card's front; a reveal control shows the back; answer controls record the review and advance (keyboard-accessible, ADR-008 interaction floor)
- the answered/remaining progression comes from the session data, not client-side guessing
- a finished session renders the completion state (STUDY-013's view or a direct hand-off)
- loading, error, and empty states per §56 — never only the happy path

### Decision
`StudyClient` fetches the session **client-side** (`getSession` via the first-party `/api` proxy) instead of the server-component pattern: the task's file list keeps the page to a mount point, and §56's loading state becomes real — the client renders "Loading…", then API errors as a panel (SET-010's error-boundary precedent needs no fetch to forward). The current card is **the first card in position order without a review**, derived from the GET payload's `reviews` and `cards` — never an index counter — so a resume lands on the right card and mid-session card additions/deletions are absorbed naturally (ADR-009's live-order decision). Answering appends the **server-confirmed** review row from the POST response; the client never advances on an unconfirmed answer. Failure handling is explicit (§55): unknown errors stay on the card for retry, but `CARD_NOT_FOUND` and `REVIEW_ALREADY_RECORDED` mean the card can never be answered in this session — the client skips it (ADR-009's "deleted cards fail with 404 and are skipped"), shows the API's message, and moves on. Reveal → two binary controls ("Correct"/"Incorrect", ADR-009) are plain keyboard-focusable buttons; the answer controls swap in only after reveal. `getSession`/`recordReview` in `lib/api.ts` map the study endpoints' error codes to the established message register. `page.tsx` was touched beyond the file list because the shell it rendered in STUDY-011 is the client's only mount point (SET-009 precedent).

### Tests
- `pnpm --filter @danisolation-recall/web test` (111 tests, incl. 9 new: loading state; front shown with the back hidden until "Reveal answer"; "Correct" calls `recordReview(5, { cardId: 1, correct: true })` and advances with "1 of 2 answered"; resume from a pre-existing review lands on the first unanswered card; the last answer reaches the "Session complete" heading with "1 of 1 answered." and the back link; a non-ACTIVE session renders "This session is finished." with no controls; an empty set offers the way back; a recording failure shows the error and stays on the card without a second call; a `CARD_NOT_FOUND` failure skips to the next card with the message shown)
- `pnpm --filter @danisolation-recall/web typecheck` and `build` succeed (`/study/[sessionId]` stays dynamic)

---

### STUDY-013

### Title
Add the session completion view

### Goal
Summarize a finished session and offer the way out.

### Dependencies
STUDY-012

### Status
DONE

### Files
apps/web/src/app/(protected)/study/[sessionId]/completion-view.tsx
apps/web/src/app/(protected)/study/[sessionId]/completion-view.spec.tsx
apps/web/src/app/(protected)/study/[sessionId]/study-client.tsx
apps/web/src/app/(protected)/study/[sessionId]/study-client.spec.tsx

### Acceptance Criteria
- shows reviewed count and accuracy (§78's progress basics, scoped to the session)
- offers navigation back to the set (and the dashboard register)

### Decision
The completion rendering is its own presentational component, `CompletionView`, consumed by `StudyClient` for **both** finished paths — a session loaded in a terminal state and an ACTIVE session whose cards ran out — so a resumed session shows the same summary it would have shown live. The heading reflects the state machine honestly: `ABANDONED` renders "Session abandoned", everything else "Session complete". The summary is computed from the session's reviews (§46's history, not a counter): `${reviewed} of ${totalCards} answered` plus `${correct} of ${reviewed} correct (${accuracy}% accuracy)` with `Math.round`; zero reviews — possible for an abandoned or instantly-finished session — render "No answers were recorded in this session." instead of a fabricated 0%. The ways out are two text links: back to the set and back to the dashboard — the protected header carries only the brand and user menu, so the dashboard exit is explicit. Accuracy is presentation-only here; the Progress phase (§78) computes its own from `user_card_progress`.

### Tests
- `pnpm --filter @danisolation-recall/web test` (115 tests, incl. 4 new CompletionView tests: counts + "2 of 3 correct (67% accuracy)" under the "Session complete" heading, 1/3 rounding to 33%, an `ABANDONED` zero-review session rendering "Session abandoned" with "No answers were recorded in this session." and no accuracy line, and both exit links (`/sets/42`, `/dashboard`); the two STUDY-012 completion assertions were updated to the extracted view — the last answer lands on the summary with "0 of 1 correct (0% accuracy)", and a resumed `COMPLETED` session renders the full summary with no study controls)
- `pnpm --filter @danisolation-recall/web typecheck` and `build` succeed (`/study/[sessionId]` stays dynamic)

---

### STUDY-014

### Title
Add the study E2E journey

### Goal
Cover the study loop in a browser against the real stack.

### Dependencies
STUDY-012
STUDY-013

### Status
DONE

### Files
apps/web/e2e/study.spec.ts
apps/web/src/app/(protected)/study/[sessionId]/study-client.tsx
apps/web/src/app/(protected)/study/[sessionId]/study-client.spec.tsx
apps/web/src/lib/api.ts
apps/web/src/lib/api.spec.ts

### Acceptance Criteria
- register → create a set → add cards → start a session → answer every card → reach the completion summary → the session is finished
- one journey test, not per-feature tests (SET-014/CARD-014 precedent)

### Decision
Writing the journey exposed a real product gap: nothing called the finish endpoint — STUDY-012/013 rendered the summary but left the session `ACTIVE` forever (no sweeper until the worker phase). The fix is the smallest behavior that makes "answer every card → the session is finished" literally true: **completing the pass finishes the session**. `StudyClient` fires `finishSession` once when an `ACTIVE` session has no unreviewed cards left (fire-and-forget with a swallowed failure — the summary is already shown, and because the effect is derived from session data, the next visit to a stranded session re-fires and self-heals). ADR-009's idempotent repeat-finish makes the single-call assumption safe even under a StrictMode double-run; an already-finished session and an empty set never trigger the call (unit-pinned). The journey itself follows SET-014/CARD-014: one test through the real UI — register → dashboard → new set → three cards → the primary "Study" control → reveal/answer each card (2 correct, 1 incorrect) with the progress line asserted at every step → "Session complete" with "2 of 3 correct (67% accuracy)" → the session's `status` polled to `COMPLETED` through the same-origin `/api` proxy with the browser's cookie → "Back to the set". Two E2E lessons recorded by the failing first run: Playwright's `name` matching is substring-based, so `getByRole("button", { name: "Correct" })` also matches "Incorrect" — `exact: true` is required for substring-sibling labels.

### Tests
- `pnpm --filter @danisolation-recall/web test:e2e` (7 Playwright tests, incl. the new study journey; the 4 auth, sets, and cards journeys still pass)
- `pnpm --filter @danisolation-recall/web test` (118 tests, incl. 3 new unit tests: the finish call fires on pass completion with `finishSession(5)`, a failed finish keeps the summary without an error and without a second call, `finishSession` posts to `/finish` with credentials and maps failures to the generic message; plus pinned non-calls for an already-finished session and an empty set)
- `pnpm --filter @danisolation-recall/web typecheck` and `build` succeed

---

## Progress phase

§78's progress basics — review count, accuracy, basic history, next review — surfaced from the data the study phase already writes (`reviews` for history and accuracy, `user_card_progress` for per-card scheduling state, `study_sessions` for history entries). This is a read-only phase: no migrations, no new invariants. As with the study phase, the surface decisions are made once (PROGRESS-001, ADR-010) before any endpoint exists — later tasks inherit those decisions rather than re-deciding them. Every read stays owner-scoped (§41) and paginated where it lists (§36).

### PROGRESS-001

### Title
Record the progress surface decision (ADR-010)

### Goal
Decide what the MVP shows for progress — surfaces, aggregates, the "due" rule, and the endpoint list — before any progress endpoint exists.

### Dependencies
None (builds on the completed study phase)

### Status
DONE

### Files
docs/adr/ADR-010-progress.md
ARCHITECTURE.md (key-decisions table: registered ADR-009, missing since the study phase, and the new ADR-010)

### Acceptance Criteria
- ADR covers context, decision, alternatives, why, tradeoffs, consequences (§74)
- decides the MVP surface(s): a dedicated protected page vs. a dashboard section vs. per-set progress, and which surface carries which of §78's four basics
- decides the "due" rule that turns `user_card_progress.next_review_at` into a study queue (due means `next_review_at <= now`, owner-scoped — or whatever the ADR records instead)
- decides the endpoint list per §52 — expected candidates: `GET /progress` (summary: review count, accuracy, due count), `GET /progress/due` (paginated due cards with their set and card info), `GET /study-sessions` (paginated history, promoting the repository's existing `listByUser`) — and the accuracy representation (integer percent vs. fraction)
- decides whether the set detail page shows per-card next review (or whether the due list is the only scheduling surface in MVP)
- states explicitly that the phase requires no schema changes — it reads only what STUDY-002..004 store

### Decision
ADR-010 records: **one dedicated `/progress` page** carrying all four §78 basics (summary strip, due queue, session history), the dashboard changing only by one "View progress" link; **due = `next_review_at <= now`** on the caller's own progress rows, never-reviewed (null) rows excluded — the queue is bounded because a card enters it only through the ladder, ordered `next_review_at` ascending, house pagination limits; **three endpoints** — `GET /progress` → `{ totalReviews, correctReviews, dueCount }`, `GET /progress/due` → paginated items of `cardId`/`front`/`setId`/`setTitle`/`nextReviewAt` (identity and destination, not the back), `GET /study-sessions` → history newest-first with `setTitle` joined in the query (not stored); **counts-only accuracy** — the API returns facts, the client derives the rounded integer percent exactly as CompletionView already does (§82, one representation); and **no per-card scheduling data on set detail** — the due queue is the only `next_review_at` surface, leaving the CARD-005 contract untouched. The ADR states the phase needs zero migrations. ARCHITECTURE.md's key-decisions table was missing ADR-009; both rows were registered while touching the table. Remaining known docs drift (ARCHITECTURE.md's data-model section predates the study tables) is left for a dedicated docs pass, not silently bundled here (§14).

### Tests
None (documentation only)

---

### PROGRESS-002

### Title
Add progress database access

### Goal
Provide a Drizzle repository for owner-scoped progress reads.

### Dependencies
PROGRESS-001

### Status
DONE

### Files
apps/api/src/progress/progress.repository.ts
apps/api/src/progress/progress.repository.integration.spec.ts
packages/database/src/index.ts (added the `count` and `isNotNull` helper re-exports)

### Acceptance Criteria
- totals query: review count and correct count for the caller, computed from `reviews` scoped through `study_sessions` (ownership in SQL, §41)
- due-cards query: the caller's `user_card_progress` rows with `next_review_at <= now`, joined to `cards` (front) and their `study_sets` (id, title) for navigation, ordered by `next_review_at` ascending, offset-paginated (§36) like the other lists
- every query is owner-scoped (§41); no N+1 (§35)
- queries match ADR-010's recorded decisions

### Decision
`ProgressRepository` exposes three reads, all taking `now` explicitly (§49, the `schedule()` convention) so "due" is a deterministic point in time. `getSummary` computes both totals in **one query** — a `count()` plus a `count(*) filter (where correct)` over `reviews` joined to `study_sessions` for ownership, exactly the ADR's facts-only shape (no accuracy field). `listDue` implements the recorded rule verbatim: `next_review_at <= now` with an `isNotNull` guard (never-reviewed rows are not due), most-overdue first with the card id tiebreaker (same-transaction timestamps can tie, the sets-list precedent), joined through `cards` → `study_sets` for `front`/`setId`/`setTitle` in the same query — no N+1. The nullable column type cannot express the WHERE guarantee, so the narrowing to `Date` happens once at the repository boundary with a comment. `countDue` reuses the identical predicate aggregated in SQL, so PROGRESS-003's summary is three cheap reads. The due predicate lives in two places (list + count) by design — it is ADR-010's rule, stable enough that a shared private helper would buy nothing.

### Tests
- `pnpm --filter @danisolation-recall/database build` refreshed the dist the API consumes (the recorded workspace gotcha — the first test run failed on the stale dist before the rebuild)
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` (189 tests, incl. 6 new repository integration tests: totals summed across sessions (5 reviews / 2 correct) with a foreign user's rows excluded, a zero-review user getting an all-zero summary and empty queue, due ordering most-overdue first with the exact ladder timestamp and `setTitle` join verified, a rescheduled-to-future card and a never-reviewed card both excluded, limit/offset pagination across the queue, and the due count matching the list)
- `pnpm --filter @danisolation-recall/api typecheck` succeeds

---

### PROGRESS-003

### Title
Add the progress summary endpoint (GET /progress)

### Goal
Return the caller's §78 basics: review count, accuracy, and due count in one response.

### Dependencies
PROGRESS-002

### Status
DONE

### Files
apps/api/src/progress/progress.module.ts
apps/api/src/progress/progress.controller.ts
apps/api/src/progress/get-progress.integration.spec.ts
apps/api/src/app.module.ts

### Acceptance Criteria
- 200 with an explicit response shape per ADR-010; accuracy in the recorded representation
- 401 `UNAUTHENTICATED` without a session
- zero-review users get a legible summary (accuracy absent or null, not a fabricated 0% — the CompletionView precedent)

### Decision
The response is exactly `{ totalReviews, correctReviews, dueCount }` — ADR-010's counts-only contract, so "accuracy in the recorded representation" means **there is no accuracy field at all**: the client derives the rounded percent from the counts, as CompletionView already does. The integration test asserts the body with `toEqual`, which pins the absence of any extra key — a future `accuracy` field would fail the test and force a deliberate contract change. The controller composes the two repository reads with `Promise.all` (the GET-study-session precedent) and supplies `new Date()` once at the boundary so summary and due count share one instant (§49). Zero-review users get the all-zero object — legible without a fabricated percentage, exactly the acceptance's intent. `ProgressModule` imports `AuthModule` like every consuming module so the guard's `SessionService` resolves.

### Tests
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` (192 tests, incl. 3 new HTTP-level tests: an exact-shape 200 seeded relative to the real clock — 4 reviews / 2 correct / 2 due, with A rescheduled into the future by the ladder — a zero-review user's `{0, 0, 0}`, and 401 `UNAUTHENTICATED`)
- `pnpm --filter @danisolation-recall/api typecheck` and `build` succeed

---

### PROGRESS-004

### Title
Add the due cards endpoint (GET /progress/due)

### Goal
Return the caller's due cards — the study queue the scheduling ladder produces.

### Dependencies
PROGRESS-002

### Status
DONE

### Files
apps/api/src/progress/progress.controller.ts
apps/api/src/progress/list-due.integration.spec.ts

### Acceptance Criteria
- explicit paginated envelope (items + next offset), same shape and limits as the other lists; query schema file-local (the list-sets precedent)
- items carry what the UI needs per ADR-010 (card front, set id/title) — no over-fetching
- 401 without a session; 400 `VALIDATION_ERROR` for limit/offset violations

### Decision
`GET /progress/due` is a straight composition of the repository's `listDue` with the house list envelope: file-local `listDueQuerySchema` (limit default 20 capped at 100 with a 400, not silent clamping — §53), `nextOffset` = `offset + limit` on a full page and null otherwise, and `new Date()` supplied at the boundary so the queue's "due" instant is the request's. The items are exactly ADR-010's projection — `cardId`, `front`, `setId`, `setTitle`, `nextReviewAt` — because the repository query selects nothing more; the back is deliberately absent since studying happens on the set page, not in the queue. No service layer: a read composing one repository call and an envelope, the SET-006 precedent.

### Tests
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` (197 tests, incl. 5 new HTTP-level tests: the queue most-overdue first with set info and a past `nextReviewAt`, `nextOffset` transitions 2 → null across pages, a foreign user's due card excluded from the owner's queue while their own queue returns exactly their one card, 400 `VALIDATION_ERROR` for `limit=101` and `offset=-1`, 401 `UNAUTHENTICATED`)
- `pnpm --filter @danisolation-recall/api typecheck` and `build` succeed

---

### PROGRESS-005

### Title
Add the session history endpoint (GET /study-sessions)

### Goal
Promote the repository's existing `listByUser` (STUDY-006) to a paginated endpoint — §78's "basic history".

### Dependencies
PROGRESS-001

### Status
DONE

### Files
apps/api/src/study/sessions.controller.ts
apps/api/src/study/sessions.repository.ts (the one ADR-010 touch: `listByUser` gained the `setTitle` join and now returns `SessionHistory[]`)
apps/api/src/study/list-sessions.integration.spec.ts

### Acceptance Criteria
- owner-scoped, newest first, explicit paginated envelope (items + next offset) with the same limits as the other lists
- 401 without a session
- no new repository queries — the endpoint composes what STUDY-006 already provides

### Decision
`GET /study-sessions` composes `listByUser` with the house list envelope (file-local query schema, limit default 20 capped at 100 with a 400, `nextOffset` = full page → `offset + limit`) — the same shape as every other list, no service layer. The one change to existing code is ADR-010's recorded touch: `listByUser` now inner-joins `study_sets` for `setTitle`, returning `SessionHistory = StudySession & { setTitle: string }`. The join is safe by construction (deleting a set cascades its sessions, so a session never lacks its set) and saves the history UI a per-row fetch (§35). Ordering stays `id` descending — sessions are serial, so id order is creation order, and started_at ties within one millisecond would otherwise be ambiguous. `SessionHistory` lives beside the other repository types; the shape change ripples nowhere else because nothing consumed `listByUser` before this endpoint.

### Tests
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` (202 tests, incl. 5 new HTTP-level tests: newest-first envelope with `setTitle` and full session fields, `nextOffset` transitions 2 → null across pages, other users' sessions excluded in both directions with their own list intact, 400 `VALIDATION_ERROR` for `limit=101` and `offset=-1`, 401 `UNAUTHENTICATED`; the repository spec's existing `listByUser` assertions still pass unchanged)
- `pnpm --filter @danisolation-recall/api typecheck` and `build` succeed

---

### PROGRESS-006

### Title
Add the progress screen

### Goal
Surface the summary, the due queue, and the history in the browser per ADR-010.

### Dependencies
PROGRESS-003
PROGRESS-004
PROGRESS-005

### Status
DONE

### Files
apps/web/src/app/(protected)/progress/page.tsx
apps/web/src/app/(protected)/progress/page.spec.tsx
apps/web/src/lib/progress.ts
apps/web/src/lib/progress.spec.ts
apps/web/src/app/(protected)/dashboard/page.tsx
apps/web/src/app/(protected)/dashboard/page.spec.tsx

### Acceptance Criteria
- the protected screen shows §78's four basics across the ADR-010 surfaces; due items link to their sets
- the dashboard offers the entry point in the established link register
- empty states per §56: nothing studied yet, nothing due; loading/error per the study screen's client-fetch pattern if used
- dates render in the fixed-locale/UTC register for hydration safety

### Decision
The page is a **server component** using the lib server-fetch pattern (`lib/progress.ts`, the `lib/sets.ts`/`lib/cards.ts` convention: cookie-forwarded, `cache: "no-store"`, empty/zeroed result without a cookie since the protected layout already gated the request, API failure through Next's error boundary) — the "if used" clause in the acceptance resolved toward the dashboard's pattern because the file list includes a lib module, and a read-only screen needs no client state. All three fetches run under `Promise.all`; each surfaces its first page only (no pagination controls — the SET-010 precedent). Accuracy is **derived once in the page** from the counts-only summary, exactly the CompletionView computation, with "No answers yet" for zero reviews instead of a fabricated 0%. Due and history items are card-style links to their sets in the SetList/CardList item register; history meta shows the status mapped display-only (`ACTIVE → Active`, etc.) plus the fixed-locale/UTC `longDate` for hydration safety. ADR-010's dashboard link landed as "View progress" beside "New set" in the existing header register. One test-driven naming fix: the summary's stat was "Due now", which collided with the queue section heading — it became "Due cards" so each heading is unique.

### Tests
- `pnpm --filter @danisolation-recall/web test` (132 tests, incl. 14 new: 9 lib tests — each helper forwards the cookie with `no-store`, returns its zeroed/empty value without a cookie and without calling the API, and throws a clear error on failure; 4 page tests — summary with "50%" derived from 2/4, zero-review "No answers yet" with both empty states and no "0%", due cards linking to `/sets/42` with their set title, history items showing "Completed" and "February 1, 2026"; plus the dashboard's "View progress" → `/progress` assertion)
- `pnpm --filter @danisolation-recall/web typecheck` and `build` succeed (`/progress` is dynamic under the protected layout)

---

### PROGRESS-007

### Title
Add the progress E2E journey

### Goal
Cover the loop end to end in a browser: study a set, then see the progress surface reflect it.

### Dependencies
PROGRESS-006

### Status
DONE

### Files
apps/web/e2e/progress.spec.ts
apps/web/package.json (the database package as a devDependency, for the fixture)
pnpm-lock.yaml

### Acceptance Criteria
- register → create a set → add cards → study them → the progress surface shows the session's counts and accuracy → a due card reappears in the queue
- one journey test, not per-feature tests (SET-014/CARD-014/STUDY-014 precedent)

### Decision
The journey runs the whole loop through the real UI — register → dashboard → new set → two cards → the Study control → one correct and one incorrect answer → the completion view → "Back to the dashboard" → "View progress" — and then asserts the summary (Reviews 2, Accuracy 50%, Due cards 0) and the history item ("E2E progress set" + "Completed", the auto-finish from STUDY-014 made visible). The one acceptance the UI alone cannot produce is "a due card reappears in the queue": the ladder never schedules into the past (its shortest step is 10 minutes), so a journey would have to sleep. The fixture instead **backdates the user's `next_review_at` rows through the database package** and reloads the page — the browser then proves the queue picks up both cards and a queue item navigates to the set. That is the same spirit as AUTH-021's original API-arranged registration: behavior through the real stack, preconditions through the cheapest honest seam. The seam required `@danisolation-recall/database` as a web devDependency (workspace link only, no runtime footprint — vitest is scoped to `src/`, so unit tests never see it); this journey also cleans up after itself in `afterAll` since the fixture owns a handle. Two run-environment notes from the failing first attempt: the journey initially skipped the home page's "Dashboard" step (every post-registration journey needs it), and an orphaned `next dev` webServer from an earlier session held Next's directory lock and had to be killed before Playwright could boot its own.

### Tests
- `pnpm --filter @danisolation-recall/web test:e2e` (8 Playwright tests, incl. the new progress journey: study → summary reflects 2 reviews / 50% accuracy / 0 due with the honest empty queue → backdated fixture → reload shows both cards in the queue → a queue item lands on its set; the 4 auth, sets, cards, and study journeys still pass)
- `pnpm --filter @danisolation-recall/web typecheck` succeeds (no src changes; the earlier build for PROGRESS-006 remains current)

---

## Search phase

§78's last MVP slice: basic set search. §51 pins the engine for MVP — PostgreSQL, with the module shaped so a later engine (Meilisearch, Typesense, OpenSearch) is a swap, not a rewrite. The MVP scope is the user's own sets searched by title and description; card content is a recorded deferral. As with the study and progress phases, the decisions land once (SEARCH-001, ADR-011) before implementation — and the lean shape they point at is a filter on the existing `GET /sets` collection rather than a new endpoint, with the dashboard's search box driven by URL state (§23). No schema changes are expected; every query stays owner-scoped (§41).

### SEARCH-001

### Title
Record the search decision (ADR-011)

### Goal
Decide what "basic set search" means — fields, matching rule, API shape, and surface — before any search code exists.

### Dependencies
None (builds on the completed sets phase)

### Status
DONE

### Files
docs/adr/ADR-011-search.md
ARCHITECTURE.md (key-decisions table: registered ADR-011)

### Acceptance Criteria
- ADR covers context, decision, alternatives, why, tradeoffs, consequences (§74)
- decides the searched fields (expected: title + description of the caller's own sets; card content and tags recorded as deferred with the reason)
- decides the matching rule and its honest MVP mechanics (expected: case-insensitive substring match via `ILIKE` on a trimmed query — no index, no tsvector migration at personal scale — with the upgrade path to trigram/GIN full-text or an external engine recorded per §51)
- decides the API shape (expected: an optional `q` parameter on `GET /sets`, the §52 collection-filtering shape, interacting with the existing limit/offset pagination) and where the query schema lives
- decides the surface (expected: a search input on the dashboard driving `?q=` URL state, distinguishing "no sets yet" from "no matches" per §56) and whether a dedicated search module/page is justified today (§28 vs. §85/§87)
- states explicitly whether the phase requires schema changes (expected: none)

### Decision
ADR-011 records: **fields** — the caller's own sets matched on `title` and `description`, with card content and tags deferred (per-set text aggregation and a ranking question nothing asks for yet; tags do not exist); **matching** — case-insensitive substring via `ILIKE '%q%'` on a trimmed query with `%`/`_`/`\` **escaped** in the input (§42 — a user cannot inject wildcard semantics into their own search), no index and no migration at personal scale, upgrade paths recorded (pg_trgm for substring speed, tsvector for relevance, §51's engine ladder); **API** — an optional `q` on the existing `GET /sets` (§52 collection filtering, not a new resource), file-local schema, 200-character cap with 400 beyond (§53), and **empty/whitespace `q` means no filter rather than an error** (clearing a search box is a normal action, not malformed input); **surface** — a plain HTML form (`method="get"`, `action="/dashboard"`) so the query lives in URL state (§23) with zero client JavaScript, and three distinct §56 states (no library / no matches with the query retained / matches); **no search module or page today** — one collection filtered by its own repository is not a domain (§85, §87), and §51's engine-swappability is honored by the matching SQL living in the sets repository; and **no schema changes**. ARCHITECTURE.md's key-decisions table registered the ADR.

### Tests
None (documentation only)

---

### SEARCH-002

### Title
Add set search to the sets API

### Goal
Let `GET /sets` filter the caller's sets by a free-text query.

### Dependencies
SEARCH-001

### Status
DONE

### Files
apps/api/src/sets/sets.repository.ts
apps/api/src/sets/sets.controller.ts
apps/api/src/sets/list-sets.integration.spec.ts
packages/database/src/index.ts (added the `ilike` and `or` helper re-exports)

### Acceptance Criteria
- `listByOwner` accepts an optional query and filters owner-scoped in SQL (`ILIKE` on title and description per ADR-011) — a foreign set is never searchable, §41
- the controller's query schema gains `q` (trimmed; bounds per ADR-011 with 400 `VALIDATION_ERROR` outside them) — file-local, the list-sets precedent
- filtering composes with the existing limit/offset pagination and `nextOffset` rule
- no filtering behavior changes when `q` is absent

### Decision
ADR-011's rule lands almost verbatim. `listByOwner` gains an optional third parameter; the pattern is built by escaping `%`/`_`/`\` in the query (`replace(/[\\%_]/g, "\\$&")`) and wrapping in wildcards, then composed as `or(ilike(title), ilike(description))` — **ownership stays the unconditional first condition of the same WHERE clause**, so a foreign set is unsearchable by construction. The optional branch flows through drizzle's `and(undefined)` tolerance instead of a non-null assertion, and the empty-after-trim case is the falsy `q` (schema trims first, so whitespace arrives as `""`). The controller schema adds `q` with the contracts' established `transform().pipe()` trim-then-cap (200 characters, 400 beyond). The `nextOffset` rule is untouched — which the tests had to learn: with limit 1 and 2 matches, the second page is *also* a full page and advertises `nextOffset: 2` (SET-005's no-COUNT(*) rule); the first test run expected `null` there and was corrected to the recorded behavior, with the empty third page pinning the transition. The search fixtures live on a third seeded user so the spec's pre-existing exact-list assertions stay untouched.

### Tests
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` (210 tests, incl. 8 new HTTP-level tests: case-insensitive title match across two sets, description match, empty page for a non-matching query, a foreign user's sets never returned whatever the query, filter+pagination across three pages (2 → 2 → empty/null), `%` and `_` treated literally (an unescaped `%` would have matched everything), empty and whitespace `q` returning the unfiltered library, and 400 for a 201-character query)
- `pnpm --filter @danisolation-recall/database build` refreshed the dist (the workspace gotcha) before the suite ran
- `pnpm --filter @danisolation-recall/api typecheck` and `build` succeed

---

### SEARCH-003

### Title
Add search to the dashboard

### Goal
Let the user filter their sets from the browser.

### Dependencies
SEARCH-002

### Status
DONE

### Files
apps/web/src/app/(protected)/dashboard/page.tsx
apps/web/src/app/(protected)/dashboard/page.spec.tsx
apps/web/src/components/search-input.tsx
apps/web/src/components/search-input.spec.tsx
apps/web/src/lib/sets.ts
apps/web/src/lib/sets.spec.ts

### Acceptance Criteria
- the dashboard offers a labeled search input whose submission is URL state (`GET /dashboard?q=…`, §23) — server-rendered filtering, no client cache
- `listSets` forwards the query to the API
- results render through the existing SetList; a query with no matches shows a distinct no-results state (§56) that keeps the search box usable, while an empty library keeps the create-a-set offer
- the input is keyboard-accessible with a visible focus state (ADR-008 floor)

### Decision
`SearchInput` is a **server component rendering a plain HTML form** (`method="get"`, `action="/dashboard"`, input `name="q"`) built from the existing Input/Button primitives — submitting is a normal browser navigation, so the query lands in the URL (§23) and the server re-renders the filtered list with zero client JavaScript; keyboard access and the focus floor come free from the primitives. `listSets` gains an optional `q` and URL-encodes it into the request. The dashboard reads `?q=` via the App Router's promised `searchParams`, passes it through verbatim (the API owns trimming), and keeps three §56 states distinct by `query && sets.items.length === 0`: the no-matches panel quotes the query back with a refine hint and suppresses SetList's create-a-set offer, while a truly empty library keeps it — and the input sits above the list either way, always usable. One incidental cleanup: the page's metadata title had a mojibake em dash from an earlier era; the edit restored the real character.

### Tests
- `pnpm --filter @danisolation-recall/web test` (139 tests, incl. 9 new: 3 SearchInput tests — labeled input with a Search button, the current query prefilled, and the form's GET/`/dashboard`/`q` contract asserted through the input's form reference; 2 lib tests — `q` forwarded as `?q=biology` and URL-encoded with a space/percent query; 4 dashboard tests updated or added — every render passes `searchParams`, the URL query reaches `listSets` with the input prefilled and matching sets rendered, and the no-matches panel quotes the query while the create-a-set offer disappears)
- `pnpm --filter @danisolation-recall/web typecheck` and `build` succeed (`/dashboard` stays dynamic)

---

### SEARCH-004

### Title
Add the search E2E journey

### Goal
Cover the loop in a browser: create sets, search them, hit the no-matches state, and clear back.

### Dependencies
SEARCH-003

### Status
DONE

### Files
apps/web/e2e/search.spec.ts

### Acceptance Criteria
- register → create two distinguishable sets → search matches one and not the other → a nonsense query shows the no-matches state → clearing the query restores the full list
- one journey test, not per-feature tests (SET-014/CARD-014/STUDY-014/PROGRESS-007 precedent)

### Decision
One journey, following the phase's form mechanics exactly: the two sets are created through the UI (navigating between creations via `goto("/dashboard")`, the auth journey's established full-navigation idiom), the search box is driven by fill + Search click, and every leg asserts the URL state — `/dashboard?q=Spanish` with the matching set visible and the other absent (`toHaveCount(0)`), then the no-matches panel quoting the query with the input still holding it (the retry affordance), then clearing (`/dashboard?q=` with the empty value) restoring both sets. One API-name fix from the first run: `getByLabelText` is Testing Library, not Playwright — the correct method is `getByLabel`. Run-environment note: the previous E2E run's `next dev` webServer survived again on Windows and held the directory lock; the kill-and-rerun pattern from PROGRESS-007 applies and may be worth a pre-test cleanup hook someday.

### Tests
- `pnpm --filter @danisolation-recall/web test:e2e` (9 Playwright tests, incl. the new search journey; the auth, sets, cards, study, and progress journeys still pass)

---

## Organization phase

§78's last open MVP decision: folders or tags — choose one. ADR-012 chooses **tags**: many-to-many labeling matches how a personal library grows, keeps the MVP free of hierarchy decisions, and composes with the search filter rather than competing with it. The decision is recorded once (ORG-001) and the tasks inherit it: two tables, a replace-style assignment endpoint, a composed `?tag=` filter, and two small UI additions. Deleting a tag must never touch a set — content is content (§46), organization is not.

### ORG-001

### Title
Record the organization decision (ADR-012)

### Goal
Choose between folders and tags for MVP and fix the schema, API, and UI shape before any table exists.

### Dependencies
SEARCH-004

### Status
DONE

### Files
docs/adr/ADR-012-organization.md
ARCHITECTURE.md (key-decisions table: registered ADR-012)

### Acceptance Criteria
- ADR covers context, decision, alternatives, why, tradeoffs, consequences (§74)
- decides folders vs. tags with the reasoning recorded against the current dashboard/search reality
- decides the schema shape (tables, ownership, uniqueness, caps) and the deletion semantics
- decides the API shape (list, assignment strategy, filter parameter) and the UI surface
- states what is deferred (the other option, tag rename/delete, counts)

### Decision
ADR-012 chooses **tags**: a set can carry several of the user's own labels, which matches reality better than single-bucket containment, and the MVP slice stays free of tree/move complexity. Schema: `tags` (user-owned, name unique per user case-insensitively via an expression index, 1–50 chars) and `set_tags` (unique `(set_id, tag_id)`, index leading on `tag_id`, no `user_id` — ownership flows through both parents, and assignment requires the tag to belong to the set's owner). At most 10 tags per set (§53 ceiling, 400 beyond). API: `GET /tags` (id + name) and `PUT /sets/:id/tags` — a **replace** contract (`{ tags: string[] }`, unknown names created for the caller, owner-only, idempotent by nature) because the natural UI is one field on the set forms. Filter: `GET /sets?tag=<tagId>` composing with `q` — the id, not the name, for URL stability. UI: a comma-separated tags field on the set forms (no picker component yet) and dashboard tag filter links. Deferred to Phase 2: folders (§80), tag rename/delete, counts, autocomplete. Content safety: removing a tag never touches a set.

### Tests
None (documentation only)

---

### ORG-002

### Title
Add the tags tables and migration

### Goal
Define `tags` and `set_tags` in the database schema and generate the migration.

### Dependencies
ORG-001

### Status
DONE

### Files
packages/database/src/schema.ts
packages/database/drizzle/0008_silky_thena.sql
docs/database/schema.md

### Acceptance Criteria
- `tags`: id, user_id (FK → users, on delete cascade), name (not null), created_at, updated_at — house conventions (§49); unique case-insensitive name per user (expression unique index on `(user_id, lower(name))`)
- `set_tags`: set_id (FK → study_sets, on delete cascade), tag_id (FK → tags, on delete cascade), unique `(set_id, tag_id)`; index leading on `tag_id`
- migration generated and applies cleanly; schema documentation updated

### Decision
ADR-012's schema lands with two judgment calls made concrete. The case-insensitive uniqueness is an **expression unique index** (`uniqueIndex(...).on(userId, sql\`lower(name)\`)`) rather than a table constraint — Postgres cannot put an expression in a table-level UNIQUE constraint, so the index is the mechanism; the column keeps the display casing. `set_tags`' pair identity is a **composite primary key** (`primaryKey({ columns: [...] })`) rather than a surrogate id plus unique constraint: the pair *is* the row's identity in a pure join table, the PK delivers the ADR's uniqueness with an implicit index, and no `serial id` is ever read. Both tables follow the house comment-per-table convention recording the ADR rationale, and the schema docs gained both tables plus ER diagram edges (`users → tags`, `set_tags` bridging `study_sets` and `tags`).

### Tests
- `pnpm --filter @danisolation-recall/database db:generate` produced `drizzle/0008_silky_thena.sql` (both tables, composite PK, cascade FKs, `set_tags_tag_id_index`, the expression unique index — SQL inspected before applying)
- `pnpm --filter @danisolation-recall/database db:migrate` applied it (9 migrations in the journal); `tags` and `set_tags` verified in psql (columns, `tags_user_id_lower_name_unique` ON `(user_id, lower(name))`, composite PK, both cascade FKs, the tag_id index)
- `pnpm --filter @danisolation-recall/database typecheck` and `build` succeed (dist refreshed for the API); the API's 210 tests pass unchanged

---

### ORG-003

### Title
Add tag database access

### Goal
Provide a Drizzle repository for tag persistence and per-set assignment.

### Dependencies
ORG-002

### Status
DONE

### Files
apps/api/src/tags/tags.repository.ts
apps/api/src/tags/tags.repository.integration.spec.ts
packages/database/src/index.ts (added the `inArray` helper re-export)

### Acceptance Criteria
- list by user (id + name), list by set, create-or-get by (owner, name)
- replace a set's assignments in one transaction: verify the set is owned (foreign set indistinguishable from missing, §41), create-or-get every incoming name, delete the join rows that fell out, insert the new ones
- assignment requires the tag to belong to the set's owner (§41)
- every query owner-scoped; no N+1 (§35)

### Decision
`TagsRepository.listByUser` / `listBySet` are plain owner-scoped reads (alphabetical by name — the filter UI's vocabulary). The heart is `replace(setId, ownerId, names)`, one transaction (§34): ownership check → **batched create-or-get** (select existing by `lower(name) in (...)`, insert only the missing with `onConflictDoNothing` — the ORG-002 expression index turns a raced duplicate into a no-op — then re-select to map names to ids) → delete **all** of the set's join rows → insert the target joins. Delete-all-then-insert-all beats a notInArray diff: `set_tags` rows carry no timestamps, so surviving rows are indistinguishable after the write, and the empty-list edge disappears. The repository normalizes names (trim, drop empties, dedupe case-insensitively, first casing wins) because it is the only writer and owns the invariant; the length/ceiling bounds stay in ORG-004's schema (§53 boundary). The acceptance's "create-or-get by (owner, name)" exists **batched** — a public per-name variant would be dead code until an endpoint needs it (§107, §35). Ordering assertions in the tests avoid mixed-case collation dependence: ascending order is pinned on a single-case subset.

### Tests
- `pnpm --filter @danisolation-recall/database build` refreshed the dist (the workspace gotcha) before the suite ran
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` (218 tests, incl. 8 new repository integration tests: replace creates unknown names and trims input, case-insensitive dedupe with first-casing-wins, a surviving name keeps the same tag row across replaces (create-or-get, not recreate), dropped tags leave the set but stay in the user's vocabulary, an empty replace clears the set's tags without touching the user's, foreign/unknown sets return notFound with nothing leaked, the same name under a different user is a different tag row, and listByUser is alphabetical and owner-scoped)
- `pnpm --filter @danisolation-recall/api typecheck` succeeds

---

### ORG-004

### Title
Add the tag endpoints

### Goal
Expose `GET /tags` and the replace-style `PUT /sets/:id/tags`.

### Dependencies
ORG-003

### Status
DONE

### Files
apps/api/src/tags/tags.module.ts
apps/api/src/tags/tags.controller.ts
apps/api/src/tags/get-tags.integration.spec.ts
apps/api/src/tags/put-set-tags.integration.spec.ts
packages/contracts/src/set-tags.schema.ts
packages/contracts/src/set-tags.schema.spec.ts
packages/contracts/src/index.ts
apps/api/src/app.module.ts

### Acceptance Criteria
- `GET /tags`: the caller's tags, 401 without a session
- `PUT /sets/:id/tags`: replaces the set's tags from a shared schema (`{ tags: string[] }` — trimmed, deduped, each 1–50 chars, at most 10 with 400 beyond, per ADR-012); 200 with the set's tags after replace; 404 `SET_NOT_FOUND` for a foreign/missing set; 401 without a session
- contracts schema lives in `packages/contracts` with user-facing messages (the register/card precedent) — the web form validates with the same schema

### Decision
Two controllers in one module, the CARD-004 precedent: `TagsController` at `tags` (the plain unpaginated array — a personal tag vocabulary is small, and ADR-012 deferred counts) and `SetTagsController` at `sets/:id/tags` with the local `parseSetId` fold into 404 `SET_NOT_FOUND`. The body schema is **shared** (`setTagsSchema` in contracts): per-name transform().pipe trimming then 1–50 with the house messages, and `array.max(10)` applying to the submitted list — the ceiling bounds the payload, while the repository's case-insensitive dedupe remains the invariant owner (a 12-name list that dedupes to 5 still fails; the contract bounds what is sent, §53). `PUT` returns 200 with the full tag rows (§82: no duplicated response type), and Nest's PUT default status needed no override.

### Tests
- `pnpm --filter @danisolation-recall/contracts test` (51 tests, incl. 6 new: trimming applied, empty list valid (clearing a set is a real action), blank name after trim, 51-char name, 11 tags, missing field)
- `pnpm --filter @danisolation-recall/contracts build` refreshed the dist the API consumes
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` (230 tests, incl. 12 new HTTP-level tests: alphabetical owner-scoped `GET /tags` hiding other users', replace trimming and creating unknown names, case-insensitive reuse of the same tag row, dropped tags removed, empty list clearing, foreign set 404 with its own tags intact, malformed/unknown ids folded into 404, 400 for 11 tags and a 51-char name, 401)
- `pnpm --filter @danisolation-recall/api typecheck` and `build` succeed

---

### ORG-005

### Title
Add the tag filter to GET /sets

### Goal
Extend the sets collection with `?tag=<tagId>`, composing with `q`.

### Dependencies
ORG-003

### Status
DONE

### Files
apps/api/src/sets/sets.repository.ts
apps/api/src/sets/sets.controller.ts
apps/api/src/sets/list-sets.integration.spec.ts

### Acceptance Criteria
- `listByOwner` accepts an optional tag id and filters through the `set_tags` join, owner-scoped in SQL (§41) — a tag the caller does not own yields an empty page, not another user's sets
- composes with `q` and the existing limit/offset pagination and `nextOffset` rule
- absent `tag` behaves exactly as before

### Decision
The tag filter is a **semijoin via `inArray(studySets.id, subquery)`** rather than a conditional join in the outer query: conditional INNER JOINs would either duplicate multi-tagged sets or vanish untagged ones, and a LEFT JOIN would need a DISTINCT — the subquery keeps one query shape, one row per set, and composes with `q` as just another `and()` branch (`and()` ignores the undefined when no tag is given). The subquery itself requires `tags.user_id = ownerId`, so a foreign tag id yields an empty page *in SQL*, not by application filtering (§41, §32). The controller's schema coerces `tag` to a positive integer with 400 outside (the limit/offset precedent); the parameter is the tag's **id** per ADR-012 — stable and unambiguous where a name would break under a future rename.

### Tests
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` (234 tests, incl. 4 new HTTP-level tests: the science tag returning exactly its two sets newest-first, composition with `q` in both the matching and conflicting directions, a foreign user's same-named tag id yielding an empty page, and a malformed tag id rejected with 400; the tag fixtures live on the spec's third seeded user so the pre-existing exact-list assertions stay untouched)
- `pnpm --filter @danisolation-recall/api typecheck` and `build` succeed

---

### ORG-006

### Title
Add tags to the set forms

### Goal
Let the owner label a set from the create and edit forms.

### Dependencies
ORG-004

### Status
DONE

### Files
apps/web/src/app/(protected)/sets/new/create-set-form.tsx (+ spec)
apps/web/src/app/(protected)/sets/[id]/edit/edit-set-form.tsx (+ spec)
apps/web/src/app/(protected)/sets/[id]/edit/page.tsx (+ spec)
apps/web/src/app/(protected)/sets/[id]/page.tsx (+ spec)
apps/web/src/lib/api.ts (+ spec)
apps/web/src/lib/sets.ts (+ spec)
apps/api/src/tags/tags.controller.ts
apps/api/src/tags/tags.repository.ts (+ spec assertion update)

### Acceptance Criteria
- both forms gain a labeled Tags field (comma-separated names) validated with the shared schema
- submission sends the tag names with the set payload (or the replace call after create) and errors show clear messages (§56)
- the detail page shows the set's tags

### Decision
The Tags field is a **controlled `useState` input beside RHF** rather than a registered field: RHF's `values` are typed by the resolver's schema (createSetSchema/updateSetSchema — the POST/PATCH contracts, unchanged), and the tags text validates separately through a `setTagsSchema.safeParse` in the submit handler — the same shared contract the API uses, so a 51-character name is blocked client-side with the identical message. Flows differ per operation's idempotency (§55): the **create form is two-phase** — `createSet` (non-idempotent) remembers the new id in a ref, so a failed tag replace shows the error, keeps the values, and a resubmit retries *only the tags* (a test pins that the set is never created twice); the **edit form runs both idempotent calls in order** (`updateSet` → `replaceTags`) and a resubmit safely retries the whole save. The detail page shows the tags in a dl row ("None yet" when untagged) and the edit page prefills the field — both read via a new `getSetTags` server fetcher (lib/sets, the getSet null-for-404 pattern), which required the missing read endpoint: `GET /sets/:id/tags` on `SetTagsController` with `listBySet` upgraded to null for a foreign/unknown set (the ORG-003 spec assertion updated accordingly). `replaceTags` in lib/api maps 404 to "This set no longer exists." and the rest to a generic save-failure message. Files beyond the original list are the read endpoint, its repository upgrade, and the two pages/lib fetchers — the only mount and read points for the feature (SET-009 precedent).

### Tests
- `pnpm --filter @danisolation-recall/web test` (155 tests, incl. 16 new: 3 CreateSetForm tests — tags saved via `replaceTags(42, { tags: ["Biology", "exam prep"] })` after create, an invalid tag blocking both calls, and the tag-failure retry proving `createSet` runs once while `replaceTags` runs twice; 4 EditSetForm tests — prefill from `initialTags`, tags saved with the set, tag-failure error keeping the values, plus the existing submit now asserting the empty-list replace; 3 lib/api `replaceTags` tests and 4 lib/sets `getSetTags` tests following the house patterns; 2 detail-page and 2 edit-page tests — tags rendered, "None yet", prefill, empty prefill)
- `pnpm --filter @danisolation-recall/web typecheck` and `build` succeed

---

### ORG-007

### Title
Add the dashboard tag filter

### Goal
Let the user filter the library by tag from the dashboard.

### Dependencies
ORG-004
ORG-005

### Status
DONE

### Files
apps/web/src/lib/tags.ts (+ spec)
apps/web/src/lib/sets.ts (+ spec)
apps/web/src/components/search-input.tsx (+ spec)
apps/web/src/app/(protected)/dashboard/page.tsx (+ spec)

### Acceptance Criteria
- the dashboard lists the caller's tags as filter links composing with `?q=` (URL state, §23); the active tag is visible in the URL and clearable
- `listTags` follows the cookie-forwarding lib pattern
- §56 states stay distinct (empty library, no matches for the tag/text combination, results)

### Decision
The API side already existed (ORG-005's `tag` semijoin), so this is web-only. `listTags` (lib/tags) follows the house cookie-forwarding pattern (empty list without a cookie, throw on API failure). `listSets` gained an optional `tagId` composed into the query string the same hand-rolled way as `q` (URLSearchParams would re-encode space as `+` and break the pinned `%20` expectations). **Composition needed one non-listed file: `SearchInput`.** It is a zero-JS GET form, so an active `?tag=` would be silently dropped on submit — the component now takes `tagId` and renders a hidden `tag` field, keeping both filters composed with no client JavaScript. On the page, `?tag=` folds per its nature: a *malformed* param folds into "no filter" (it is filter state, §23 — unlike a resource id which 404s), while a *well-formed but unknown/foreign* id stays an active filter that matches nothing (§41 owner-scoped semijoin) and keeps its escape hatch — the "Clear filter" link renders whenever `tagId` is set, so the URL state is never a dead end. §56 states: empty library keeps SetList's create offer; no-matches hint names the active filters (`"query"` / `the selected tag` / both joined "with"), with the q-only wording byte-identical to the SEARCH-003 string; the active tag is marked `aria-current="true"`.

### Tests
- `pnpm --filter @danisolation-recall/web test` (170 tests, incl. 15 new: 3 lib/tags `listTags` tests; 2 lib/sets tests — `?tag=7` and the composed `?q=biology&tag=7`; 2 search-input tests — hidden tag field present/absent; 8 dashboard tests — filter links with hrefs, links composing with `?q=`, `aria-current` + clear href, query preserved when clearing, tag-only and combined no-matches hints, malformed param folding to no filter, unknown tag id keeping the clear link)
- `pnpm --filter @danisolation-recall/web typecheck` and `build` succeed

---

### ORG-008

### Title
Add the organization E2E journey

### Goal
Cover the loop in a browser: label sets, filter by tag, compose with search.

### Dependencies
ORG-006
ORG-007

### Status
DONE

### Files
apps/web/e2e/organization.spec.ts

### Acceptance Criteria
- register → create two sets → label them via the forms → filter the dashboard by tag → compose tag + search text → the no-matches state
- one journey test, not per-feature tests (SET-014/CARD-014/STUDY-014/PROGRESS-007/SEARCH-004 precedent)

### Decision
One journey covering the full loop against the real stack: register → create "Spanish vocabulary" (tags "language, vocabulary") and "Japanese kanji" (tags "language") through the create form → relabel the second set through the edit form (prefill asserted, "language, jlpt") → detail pages show the name-ordered tag strings ("jlpt, language" pins the repository's `asc(tags.name)` ordering) → dashboard tag chips filter (shared tag keeps both sets, narrow tag keeps one) → search composes with the active tag via the hidden field → the combined no-matches hint names both filters → "Clear filter" keeps the query and lands on the text-only no-matches state. Two selector disciplines: tag chips use `exact: true` ("vocabulary" is a substring of the "Spanish vocabulary" set link — the STUDY-014 gotcha), and the composed-URL assertions check the params **individually** rather than pinning their order, because the GET form serializes the hidden `tag` field before `q` (`?tag=55&q=Spanish`) — the first run failed on that assertion, not on the app: both params were present and applied, so the test was corrected (impl-correct-not-test rule doesn't apply; the assertion was over-specified).

### Tests
- `pnpm --filter @danisolation-recall/web test:e2e` — 10/10 journeys pass (the new organization journey plus the 9 existing ones); the orphaned-`next dev` directory lock (PID 28256) was killed before the run (recurring Windows gotcha)

---

## Remaining MVP phases (coarse — not yet decomposed)

None. With the organization phase decomposed above, every §78 MVP slice has shipped or has an atomic task chain; everything beyond it is the post-MVP work below.

---

# UI Polish phase (post-MVP)

Direction per the approved plan (plan: ui-ux-polish-phase): deepen the ADR-008 paper identity — no component library, one icon dep (`lucide-react`), subtle CSS-only motion, whole app, foundation first. Phase-wide invariant: visible copy, accessible names, hrefs, and roles survive unchanged; icons and aria attributes are additive only. Executed after ORG-008 so the E2E journeys are green before any restyle.

### UX-001

### Title
Write ADR-013: UI polish decisions

### Goal
Record the decisions that deepen ADR-008's design system without replacing it.

### Dependencies
ORG-008

### Status
DONE

### Files
docs/adr/ADR-013-ui-polish.md

### Acceptance Criteria
- amends (not supersedes) ADR-008: tokens, product register, a11y floor, marker rationing stand
- decides: lucide-react as the single new runtime dep (stroke icons, labels always visible — no icon-only controls, §57); registers centralized as real components in components/ui; motion policy (transform/opacity only, 150–250ms, dies under the existing prefers-reduced-motion kill-switch, CSS-only — hydration-safe); no webfont (ADR-008 holds); dark mode and toasts explicitly deferred/rejected; interactions stay architectural (§23 URL state, inline confirms, zero client-JS search, §25 router.refresh)
- records the phase-wide test invariant: copy, accessible names, hrefs, roles frozen; the 170-test suite pins roles/copy, zero class assertions

### Decision
ADR-013 written in the house format (Context/Decision/Alternatives/Why/Tradeoffs/Consequences). Key framings beyond the acceptance list: the §59 foundation "written down, not grown" (centralizing deletes duplication rather than adding a layer); icons justified by stroke-weight match with the existing 2px ink borders; dark mode deferred with the cost bounded to a token-file change because the palette is centralized OKLCH; per-task test budget recorded (zero expected changes outside UX-004's additive tests). Rejected alternatives documented: shadcn/Radix reskin, bold rebrand, icon-only controls, dialog confirms, a packages/ui extraction, framer-motion.

### Tests
- none (decision task). Artifact check per §73: claims verified against the code before writing — `toHaveClass|getByTestId|data-testid` = 0 occurrences in apps/web/src (zero class assertions), and 13 register comments across 11 files (dashboard and card-list carry two each). Test counts cited from this session's runs: 170 unit, 10 E2E journeys.

---

### UX-002

### Title
Centralize the panel and link registers

### Goal
Replace the ~14 copy-pasted register strings with shared exports so styling changes stop touching 13 files.

### Dependencies
UX-001

### Status
DONE

### Files
apps/web/src/components/ui/panel.tsx (+ spec)
apps/web/src/components/ui/text-link.tsx (+ spec)
apps/web/src/components/set-list.tsx, card-list.tsx
apps/web/src/app/(protected)/dashboard/page.tsx, progress/page.tsx
apps/web/src/app/(protected)/sets/[id]/page.tsx, edit/page.tsx, create-card-form.tsx, edit-card-form.tsx, delete-card-button.tsx, move-card-button.tsx
apps/web/src/app/(protected)/study/[sessionId]/study-client.tsx, completion-view.tsx
apps/web/src/app/page.tsx, login/page.tsx, register/page.tsx

### Acceptance Criteria
- `Panel` (section + panel classes + exported `panelClassName`) and `TextLink` (link register) live in components/ui with small specs
- every register-citing file imports from ui/ instead of re-declaring the string; set-list/card-list link-panels use `panelClassName` on their Link
- zero visible change: no copy/name/href drift (pure class moves)

### Decision
Two exports per register, per the ADR-013 shape: a component (`Panel` renders `<section>`; `TextLink` renders next/link) plus the raw class-string constant for non-section elements — divs (auth pages), `li` items (progress due/history, card-list), links (set-list items), and link-styled `<button>`s (MoveCardButton with its disabled suffix appended, DeleteCardButton). The study/completion flex-prefixed panel variant became `<Panel className="flex flex-col gap-4">` (class-string order differs; CSS-equivalent — no test pins classes). The dashboard's two tag-chip variants were deliberately left inline: they are not the plain register and UX-003 restyles chips entirely. The "Same … register" comments retired in favor of the imports; `delete-set-button.tsx` was dropped from the task's file list — it has no register strings (it uses Button). The old const sites became plain component swaps, so `Link` imports disappeared from the six files whose only links were register links (kept where chips/due items/set items remain).

### Tests
- `pnpm --filter @danisolation-recall/web test` — **176 passed (32 files)**: the pre-existing 170 unmodified + 6 new (3 Panel, 3 TextLink: register classes, className append, exported constants) — the zero-churn invariant held
- `pnpm --filter @danisolation-recall/web typecheck` and `build` succeed
- grep verification: the panel string now exists only in `ui/panel.tsx` (+ its spec); the only remaining `underline-offset-4` copies are the dashboard's two chip variants (UX-003's scope)

---

### UX-003

### Title
Icons and real buttons, app-wide

### Goal
Give every action visual weight: icons beside text, nav actions as button-styled links, tag chips.

### Dependencies
UX-002

### Status
DONE

### Files
apps/web/package.json (+ lucide-react, pnpm-lock.yaml)
apps/web/src/components/ui/text-link.tsx (+ spec)
apps/web/src/components/search-input.tsx, set-list.tsx, card-list.tsx
apps/web/src/app/(protected)/dashboard/page.tsx
apps/web/src/app/(protected)/sets/[id]/page.tsx, start-study-button.tsx, delete-card-button.tsx, move-card-button.tsx
apps/web/src/app/(protected)/study/[sessionId]/study-client.tsx, completion-view.tsx
apps/web/src/app/(protected)/progress/page.tsx

### Acceptance Criteria
- lucide-react icons are decorative (aria-hidden) beside unchanged text labels: Plus/New set, TrendingUp/View progress, Pencil/Edit set, Play/Study, Search, ArrowUp/ArrowDown/Move, Trash2/Delete, Hash/tag chips, empty-state icons
- TextLink gains a button variant (bg-card border rounded-md, Button-secondary padding); nav actions use it; tag filter links become rounded-full chips keeping aria-current, hrefs, names
- inline confirms stay inline; every accessible name and href unchanged

### Decision
`buttonLinkClassName` transcribes the Button primitive's base + secondary colors onto a link (min-h-11, rounded-md, active:translate-y-px) plus `gap-2` for icon seating — the two registers stay visually identical by construction. All icons are `aria-hidden` at h-4 w-4 (h-6 for empty states), so every accessible name and href is byte-identical. **Tag chips lean into the highlighter metaphor: the active chip fills with `bg-marker/40` (highlighted = selected), inactive chips are card-bordered pills** — aria-current, hrefs, and names unchanged. Empty states gained centered icons (BookOpen/SetList, Layers/CardList + study's empty set, SearchX/dashboard no-matches, CalendarCheck/progress due, History/progress history) with copy untouched. Study screen buttons got Eye/Check/X; completion-view's two ways out got ArrowLeft. Two scope trims recorded: the wordmark (layout.tsx was in the task's file list) stays icon-free — the marker-highlight chip on "Recall" already is the mark, and an icon would be decoration without information; Hash on chips was dropped for the same reason (the pill shape already says "tag"). Hash remains available if a future surface needs it.

### Tests
- `pnpm --filter @danisolation-recall/web test` — **178 passed (32 files)**: every pre-existing spec unmodified + 2 new TextLink tests (button variant renders button-weight classes but keeps link role/href; buttonLinkClassName export)
- `pnpm --filter @danisolation-recall/web typecheck` and `build` succeed

---

### UX-004

### Title
Study screen: flip, progress bar, keyboard shortcuts

### Goal
Make the daily instrument feel like one: animated reveal, visible progress, hands-on-keyboard.

### Dependencies
UX-003

### Status
DONE

### Files
apps/web/src/app/(protected)/study/[sessionId]/study-client.tsx (+ spec), completion-view.tsx (+ spec), app/globals.css (flip classes)

### Acceptance Criteria
- reveal flips the card (3D perspective + rotateY, ~200ms, backface-hidden); reduced-motion collapses to the current instant swap; `revealed` state machine unchanged
- progress bar (`role="progressbar"` + aria-valuenow/min/max) next to the pinned "N of M answered" text
- keyboard: Space/Enter reveals when hidden, 1 = Incorrect / 2 = Correct when revealed; ignored when the event originates from a button/input/link (no double-fire, no page scroll); preventDefault on handled keys
- all copy unchanged; CompletionView gets big-numeral stats with byte-identical strings

### Decision
The flip is a **true two-face card**: both faces stay mounted (front in flow sizing the card, back absolutely positioned pre-rotated 180deg), the inner wrapper transitions `rotateY(180deg)` over 200ms driven by the unchanged `revealed` state via a `data-revealed` attribute, and `backface-visibility: hidden` on each face does the rest — all authored as plain CSS in globals.css, so the existing reduced-motion kill-switch (0.01ms durations) collapses it to the instant swap with zero JS. The a11y consequence is the improvement: the hidden face is `aria-hidden` until revealed. **Justified test repair (ADR-013's escape hatch):** "back not in the DOM before reveal" became "back face aria-hidden before reveal, front face aria-hidden after" — a stronger assertion pinning the accessibility state instead of DOM absence. The completion big numeral hit a Testing Library fact: `getByText` matches only an element's **direct** text nodes, so a styled `<span>{correct}</span>` inside the compound string is invisible to it even though the rendered string is byte-identical; the three affected assertions now match via a textContent function matcher. The progress bar fills with `scaleX` (transform-only per the motion policy — a width transition would have violated it), marker-colored: the highlighter literally fills as you cover the material. The keyboard effect derives the current card inside itself from `data` + `skipped` (no restructuring around the early returns) and ignores events from BUTTON/A/INPUT/TEXTAREA/contentEditable so native activation never double-fires.

### Tests
- `pnpm --filter @danisolation-recall/web test` — **181 passed (32 files)**: +4 study-client (progressbar values, Space reveals → 1 answers incorrect → next card, Space/2 on the second card, the suppression test proving `recordReview` is NOT called while the Correct button holds focus and IS called after blur), 2 assertions repaired to the textContent matcher (completion-view ×2, study-client ×1), all other 176 untouched
- `pnpm --filter @danisolation-recall/web typecheck` and `build` succeed

---

### UX-005

### Title
Progress page visual upgrade

### Goal
Give the stats hierarchy without faking data: stat panels, badge styling, no charts.

### Dependencies
UX-003

### Status
DONE

### Files
apps/web/src/app/(protected)/progress/page.tsx

### Acceptance Criteria
- summary dl becomes three stat panels (big numeral, small label, icon) with identical copy ("50%", "No answers yet", counts)
- session status labels may be badge-styled but each full pinned string ("Completed — February 1, 2026") stays within ONE containing element (getByText constraint)
- no charts — ADR-010 is counts-only; empty states unchanged

### Decision
The summary `dl` became a `sm:grid-cols-3` row of Panel stats — icon (RotateCcw/Reviews, Target/Accuracy, AlarmClock/Due cards), a `text-4xl` numeral, and the label beneath. The exact-match test numerals ("4", "2", "50%") each live in their own `<p>`, so uniqueness held; "No answers yet" replaces the numeral at a smaller size rather than posing as a fake 0%. Session status got a **status dot badge**: a decorative colored dot (ACTIVE → marker-deep, COMPLETED → ink/60, ABANDONED → alert) inside the same span that holds the full pinned string as its direct text — the dot contributes no text nodes, so `getByText("Completed — February 1, 2026")` semantics survive while the spec's `toHaveTextContent` checks pass on the link. No charts, per ADR-010's counts-only API; the due/history empty states keep their UX-003 icons.

### Tests
- `pnpm --filter @danisolation-recall/web test` — **181 passed (32 files)**, the progress spec completely unmodified (zero-churn invariant held again)
- `pnpm --filter @danisolation-recall/web typecheck` and `build` succeed

---

### UX-006

### Title
Landing and auth polish

### Goal
Make the first impression earn the product register: hero, CTAs, feature trio.

### Dependencies
UX-002

### Status
DONE

### Files
apps/web/src/app/page.tsx, login/page.tsx, register/page.tsx

### Acceptance Criteria
- hero: headline, one-liner, feature trio panels (Create/Cards/Study with icons, one line each); CTAs are button-variant TextLinks with unchanged names ("Log in", "Create account", "Dashboard")
- auth cards: icon + spacing polish; labels, copy, names untouched

### Decision
The landing page now has a real hero: headline "Study that sticks." (new copy — the task's purpose; sentence-case, no exclamation, per ADR-008's copy rules), the pre-existing one-liner kept byte-identical, and button-variant CTA links. The home spec's link-uniqueness pins shaped the structure: signed-out users get the CTAs **in the hero** and a wordmark-only header (no duplicate "Log in"/"Create account"), signed-in users get a single "Dashboard" hero CTA with UserMenu alone in the header (auth.spec clicks exactly one "Dashboard" link and asserts "Signed in as" + email). The feature trio renders **only for signed-out visitors** — for a signed-in user this page is a doorway, not a pitch (ADR-008's product register); Create/Cards/Study panels with Plus/Layers/GraduationCap icons and one honest line each. Auth pages gained a centered marker-tinted icon chip (LogIn/UserPlus), centered heading and cross-link; all form copy, labels, and names untouched. Hero headline is an `h2` under the wordmark `h1`, trio titles `h3`s.

### Tests
- `pnpm --filter @danisolation-recall/web test` — **181 passed (32 files)**, home + auth specs completely unmodified (the uniqueness-driven structure avoided any churn)
- `pnpm --filter @danisolation-recall/web typecheck` and `build` succeed

---

### UX-007

### Title
Loading skeletons, favicon, metadata

### Goal
Design the waiting state (§56) and the browser chrome.

### Dependencies
UX-002

### Status
DONE

### Files
apps/web/src/components/ui/skeleton.tsx (+ spec)
apps/web/src/app/(protected)/dashboard/loading.tsx
apps/web/src/app/(protected)/sets/[id]/loading.tsx
apps/web/src/app/(protected)/progress/loading.tsx
apps/web/src/app/(protected)/study/[sessionId]/study-client.tsx (skeleton)
apps/web/public/favicon.svg
apps/web/src/app/layout.tsx (icons/themeColor)

### Acceptance Criteria
- route-level skeletons built from panelClassName + animate-pulse (opacity-only → reduced-motion-safe)
- study client's bare "Loading…" becomes a skeleton keeping the text as sr-only + aria-busy (existing getByText("Loading…") keeps passing)
- favicon (marker-highlighted R) + themeColor/icons metadata in the root layout

### Decision
A fifth ui primitive: `Skeleton` (ComponentProps<"div"> spread + aria-hidden + animate-pulse — opacity-only, frozen by the existing reduced-motion kill-switch). The three `loading.tsx` files mirror each page's real shape with aria-busy containers and Skeleton blocks inside Panels (title bar, search/toolbar, stat grid, list panels), so navigation shows structure rather than a blank frame. The study client's bare paragraph became a shaped skeleton with the "Loading…" text kept as `sr-only` — the existing test passes untouched, and screen readers still get the announcement. Favicon: a paper rounded-square with the marker chip behind a bold ink "R", matching the wordmark's highlight; hex approximations of the OKLCH tokens (SVG <text> needs hex). Root layout gained `icons` metadata plus a `viewport` export with `themeColor: #FAF7EC` (the paper tone). Two self-caught flaws during the task, both fixed before any review: Skeleton originally dropped extra props (its own spec failed — now spreads like every other primitive), and its spec initially omitted afterEach(cleanup).

### Tests
- `pnpm --filter @danisolation-recall/web test` — **183 passed (33 files)**: +2 Skeleton primitive tests; the study spec's "Loading…" assertion passes untouched via the sr-only text
- `pnpm --filter @danisolation-recall/web typecheck` and `build` succeed

---

### UX-008

### Title
E2E verification and docs sweep

### Goal
Prove the restyle kept the journeys green and leave the docs honest.

### Dependencies
UX-003
UX-004
UX-005
UX-006
UX-007

### Status
DONE

### Files
ARCHITECTURE.md (ADR-013 row), docs/PROGRESS.md (refresh), README.md (status refresh)

### Acceptance Criteria
- kill any orphaned next dev webServer (Windows gotcha), then all Playwright journeys pass unmodified (auth, sets, cards, search, study, progress, organization)
- ARCHITECTURE decision table gains the ADR-013 row; PROGRESS/README reflect the polish phase; ledger entries all DONE with decisions + test notes
- full verification: web tests + typecheck + build + E2E; next-env.d.ts restored after builds

### Decision
The orphaned-`next dev` lock (PID 13248) was killed before the E2E run — the third occurrence of this gotcha, always the same signature: Next names the PID in its error. **All 10 journeys (7 spec files) passed unmodified against the fully restyled app**, closing the phase's central bet. The docs sweep was run against artifacts, not memory (§73): the API and contracts suites were re-run for honest counts (API 234 — which surfaced an environment restoration, the Postgres container was up but `DATABASE_URL` wasn't in the shell, so it was loaded from `apps/api/.env` for the run; contracts 51), ADR files globbed (9 files, ADR-013 included), migrations globbed (through 0008). PROGRESS.md was stale from the pre-organization era (9 tests/journeys counts, "organization pending") and was rewritten: organization and UI polish sections added, counts corrected (9 tables, API 234 / web 183 / contracts 51 / E2E 10), plans now lead with Phase 2. README's status block and "Next up" line updated to the same facts. ADR-013 needed no finalization — its consequences section described the executed phase accurately; the per-task deviations (wordmark icon, Hash chip, textContent matcher) live in the task entries where they belong. Web suite re-verified at 183 + typecheck + build during this task's docs work; `next-env.d.ts` restored after builds.

### Tests
- `pnpm --filter @danisolation-recall/web test:e2e` — **10/10 journeys passed** (auth, cards, organization, progress, search, sets, study)
- `pnpm --filter @danisolation-recall/api test` — 234 passed (42 files, with DATABASE_URL from .env)
- `pnpm --filter @danisolation-recall/contracts test` — 51 passed
- `pnpm --filter @danisolation-recall/web test` + typecheck + build — 183 passed

---

# Folders phase (Phase 2)

Phase 2 opens per `docs/ROADMAP.md` ("tags/folders — whichever was not chosen in MVP"): tags shipped in ADR-012, so folders are the recorded §80 deferral arriving **on top of the labeling layer as containment** ("file a set into a folder", ADR-012's own wording). One phase, one ADR, the same atomic loop.

### FOLD-001

### Title
Write ADR-014: folders as containment

### Goal
Record the folders design: single-parent containment over the tagging layer, content-safe deletion, and the dashboard's third filter axis.

### Dependencies
UX-008

### Status
DONE

### Files
docs/adr/ADR-014-folders.md

### Acceptance Criteria
- decides the containment model (a set lives in at most one folder — `folders` table + `study_sets.folder_id`, not a join table), content-safe deletion (`ON DELETE SET NULL` — a deleted folder unfiles its sets, never deletes them), per-user case-insensitive unique names (the tags naming discipline), counts on `GET /folders` (navigationally essential, unlike the deferred tag counts), set placement via `folderId` on the set contracts (one assignment path, no move endpoint), and `?folder=` composing with `?q=` and `?tag=`
- records the deferrals: nested folders, bulk move, an "Unfiled" view, folder-level sharing
- the alternatives (join-table symmetry, nesting, a dedicated move endpoint) documented with rejection reasons

### Decision
ADR-014 written in the house format. Framings beyond the acceptance list: containment chosen over membership because "a folder is a shelf, not a label" — the join-table alternative would duplicate ADR-012's model and blur "where does this set live?"; counts on `GET /folders` deliberately break symmetry with the deferred tag counts because a folder list without counts cannot answer "where is my stuff", which is the feature's point; the phase decomposition (FOLD-001..008) was registered in this task's ledger edit so the ADR's consequences name the real chain. Two copy-level notes carried into later tasks: the `/folders` management page's delete confirm must say sets survive unfiled (§56 honesty), and the dashboard's no-matches hint becomes a three-filter composer.

### Tests
- none (decision task). Artifact check per §73: ROADMAP's Phase-2 line ("tags/folders — whichever was not chosen in MVP") and ADR-012's recorded promise ("Phase 2's folder addition will treat folders as containment over this labeling layer") verified by grep before writing; the schema's existing tables (9, no folder artifacts) confirmed so the migration plan starts from the real state.

---

### FOLD-002

### Title
Folders schema and migration

### Goal
Add the `folders` table and the `study_sets.folder_id` edge.

### Dependencies
FOLD-001

### Status
DONE

### Files
packages/database/src/schema.ts
packages/database/drizzle/0009_faithful_scalphunter.sql (+ journal/snapshot)
docs/database/schema.md (folders table + study_sets.folder_id row + ER edges)

### Acceptance Criteria
- `folders` (id, user_id FK cascade, name, timestamps) with the expression unique index on `(user_id, lower(name))`
- `study_sets.folder_id` nullable FK → folders, `ON DELETE SET NULL`
- migration applied; `@danisolation-recall/database` dist rebuilt

### Decision
`folders` mirrors the tags table's shape and naming discipline (expression unique index `folders_user_id_lower_name_unique` on `(user_id, lower(name))`, display casing preserved) plus a `folders_user_id_index` for the owner-scoped list. `study_sets.folder_id` is nullable with `ON DELETE SET NULL` and gained `study_sets_folder_id_index` for folder-scoped library queries. `index.ts` needed no re-export changes (`export * from "./schema"` picks up `folders`). The `folders` table is declared at the file's end with `study_sets.folder_id` referencing it through drizzle's lazy `() => folders.id` callback — a forward reference that compiles and generates correctly. `index.ts`'s drizzle helper re-exports unchanged. Generated by `db:generate` (`0009_faithful_scalphunter.sql` — verified statement by statement: CREATE TABLE, ADD COLUMN, both FKs with the right ON DELETE actions, both indexes), applied via `db:migrate`, dist rebuilt.

### Tests
- `pnpm --filter @danisolation-recall/database db:migrate` — migrations applied successfully against the running Postgres
- `pnpm --filter @danisolation-recall/database build` and `typecheck` — clean (the forward reference compiles)

---

### FOLD-003

### Title
Folders repository

### Goal
Owner-scoped folder CRUD with set counts, and the set-side placement checks.

### Dependencies
FOLD-002

### Status
DONE

### Files
apps/api/src/folders/folders.repository.ts (+ integration spec)
apps/api/src/folders/folders.module.ts
apps/api/src/app.module.ts (registration)

### Acceptance Criteria
- `listByUser` (with per-folder set counts via one GROUP BY), `create`, `rename` (outcome union: renamed | notFound | conflict for a duplicate name), `remove` (sets survive, unfiled)
- every query owner-scoped in SQL (§41); counts come from one GROUP BY join
- `assertOwned`/placement helper for the set contracts' folderId validation

### Decision
The tags repository's conventions carried over: `@Inject(DATABASE_PROVIDER)` db handle, outcome unions, and SQL-level ownership. `listByUser` is one `leftJoin` + `groupBy(folders.id)` returning `FolderWithCount` (counts ride the list per ADR-014); `create`/`rename` translate the unique violation into the conflict outcome; `remove` returns a boolean and adds nothing — the SET NULL migration owns the content-safety. `isOwnedBy` (the ledger's "assertOwned") is the placement check FOLD-004's set writes will call. **Unique-violation detection walks the cause chain**: drizzle wraps the pg error (`DrizzleQueryError.cause`), so checking `.code` on the wrapper misses it — the first integration run caught that immediately. The task also repaired **latent ORG-006 damage**: `listBySet`'s ORG-006 signature change (`Tag[] | null`) had left four unguarded call sites in the tags spec (vitest never typechecks, so they survived as runtime-passing type errors) — now `!`-asserted per house style — and the two create-set.service.spec mock rows gained the new `folderId: null`. `FoldersModule` exports the repository (the sets module consumes the placement check in FOLD-004); the controller arrives with FOLD-004.

### Tests
- `pnpm --filter @danisolation-recall/api test` — **243 passed (43 files)**: +9 folders tests (create, case-insensitive duplicate → conflict, alphabetical list with counts incl. zero-count via LEFT JOIN, other-user scoping, rename + updatedAt, foreign rename → notFound, duplicate rename → conflict, remove-unfiles proof reading the set row back with `folderId` null, foreign remove → false with the folder intact, `isOwnedBy` ×3)
- `pnpm --filter @danisolation-recall/api typecheck` — clean (including the four repaired ORG-006 stragglers)

---

### A11Y-001

### Title
Add a skip link to the protected layout

### Goal
Close the one genuine gap from the 2026-09-27 ui-ux-pro-max audit: a bypass for the repeated header (WCAG 2.4.1 hygiene).

### Dependencies
FOLD-003

### Status
DONE

### Files
apps/web/src/app/(protected)/layout.tsx (+ spec)

### Acceptance Criteria
- a "Skip to content" link as the layout's first focusable element, visually hidden until focused (the standard sr-only-until-focus pattern), targeting an id on `<main>`
- additive only: no existing copy, name, or role changes; the layout spec's 2 tests stay green
- the audit's no-defect findings are recorded here as the durable record (auth autocomplete already WCAG-2.2-conformant; no sticky UI so focus-obscured is N/A; error-summary pattern covered by per-field aria-describedby + RHF focus; keyboard shortcuts already guard interactive targets; password-visibility toggle noted as a deferred taste item, not queued)

### Decision
The standard pattern with the house styling: `sr-only focus:not-sr-only` plus an absolutely-positioned focus appearance (top-4/left-4, card surface, link-register underline and outline) — absolute positioning on focus means the reveal never shifts layout, honoring the stable-interaction rule from the ui-ux-pro-max pass. `#main-content` lands on the existing `<main>` (an id, not a new landmark). The spec test pins the three properties that matter: accessible name, href, and first-in-DOM focusable order (queried across `a[href], button, input, select, textarea`).

### Tests
- `pnpm --filter @danisolation-recall/web test` — **184 passed (33 files)**: +1 layout test (skip link first focusable + target id); the two existing layout tests untouched
- `pnpm --filter @danisolation-recall/web typecheck` and `build` succeed

---

### FOLD-004

### Title
Folders endpoints and the set contracts' folderId

### Goal
`GET/POST/PATCH/DELETE /folders`, plus `folderId` on `POST /sets` and `PATCH /sets/:id`.

### Dependencies
FOLD-003

### Status
DONE

### Files
packages/contracts/src/folders.schema.ts (+ spec, exported from index)
packages/contracts/src/set.schema.ts (folderId on create/update)
apps/api/src/folders/folders.controller.ts (+ integration spec)
apps/api/src/folders/folders.module.ts (controller added)
apps/api/src/sets/sets.controller.ts, sets.module.ts, create-set.service.ts (+ spec), sets.repository.ts

### Acceptance Criteria
- folder contracts (name 1–50 chars) validated like tags (§53); 404 `FOLDER_NOT_FOUND` for foreign/missing folders
- `GET /folders` returns `{ id, name, setCount }`; rename conflict → 409 or 400 per the house error register (record which)
- `POST /sets` / `PATCH /sets/:id` accept an optional `folderId` (null = unfile); a foreign folderId is rejected (400 with a clear code, or 404 — record the decision)

### Decision
Two register decisions, recorded as the acceptance asked: **rename/create conflict → 409 `FOLDER_NAME_TAKEN`** (the house conflict status, matching `REVIEW_ALREADY_RECORDED`), and **a foreign folderId → 404 `FOLDER_NOT_FOUND`** — §41's foreign-equals-missing principle applied to the referenced folder, mirroring the tags precedent, with the error body naming the folder so the 404 is unambiguous. Contract shape: `folderId: number().int().positive().nullable().optional()` — absent leaves placement alone, null unfiles, a number files; the update schema's "Nothing to update" refine now accepts a folderId-only PATCH. Placement enforcement sits where the house puts write decisions: the **create path validates in `CreateSetService`** (the service owns a create decision; a foreign folder throws 404 before anything is created), the **update path validates in the controller** (which already composes the repository directly), and `FoldersRepository.isOwnedBy` is the shared check; `SetsRepository.create/update` thread `folderId` through (`create` defaults to null). `SetsModule` imports `FoldersModule` for the injection. `GET /folders` returns the full rows plus `setCount` (superset of the acceptance shape). Contracts dist rebuilt after the schema change.

### Tests
- `pnpm --filter @danisolation-recall/contracts test` — **59 passed**: +4 folders-schema tests (trim, blank, >50, missing) + 4 placement tests (folderId number/null/omitted on create, non-positive/non-integer rejected, folderId-only PATCH allowed, empty PATCH still rejected)
- `pnpm --filter @danisolation-recall/api test` — **260 passed (44 files)**: +15 folders endpoint tests (full CRUD through supertest: create 201, case-insensitive duplicate 409, same-name-other-user 201, list with counts 0→1, set filed via PATCH, foreign folder on set update 404, placement at creation, unknown folderId 404, rename, foreign rename 404, unfile via null, delete-unfiles proof via GET /sets/:id, repeated delete 404, unauthenticated 401) + 2 service tests (owned folder passes through, foreign rejects before create)
- `pnpm --filter @danisolation-recall/api typecheck` — clean

---

### FOLD-005

### Title
Dashboard folder filter

### Goal
`?folder=` joins `?q=` and `?tag=` as the library's third URL-state filter, with a folder list that shows counts.

### Dependencies
FOLD-004

### Status
DONE

### Files
apps/web/src/lib/folders.ts (+ spec)
apps/web/src/app/(protected)/dashboard/page.tsx (+ spec)
apps/web/src/lib/sets.ts (folderId param, + spec)
apps/web/src/components/search-input.tsx (hidden folder field, + spec)
apps/api/src/sets/sets.controller.ts, sets.repository.ts (the `folder` query param — needed by the filter, mount-point precedent)

### Acceptance Criteria
- `listFolders` follows the cookie-forwarding pattern; the dashboard lists folders (name + count) as filter links composing with `?q=` and `?tag=`
- §56 states stay distinct: folder+tag+text no-matches names all active filters; malformed folder param folds to no filter; an unknown folder id keeps the escape hatch
- every href/aria-current/name discipline from the tag work repeats

### Design (ui-ux-pro-max pass, 2026-09-27)
Folder chips join the dashboard as a **separate row above the tag chips** — containment ("where") above labeling ("what"), each folder chip carrying the Folder icon (lucide, aria-hidden) + name + count as text ("University · 4" — counts are never color-only, per the skill's compact-label-semantics rule). The chip register is reused exactly: active folder = `aria-current="true"` + the `bg-marker/40` fill (the skill's active-state rule, already our idiom), inactive = card pill. **Both chip rows gain `min-h-11` + `inline-flex items-center`** — the skill's 44px touch-target floor flags the shipped tag chips (~32px) as a mobile miss; the fix covers both rows rather than splitting the register. Chips wrap via the existing `flex flex-wrap` (the skill's high-severity chip-reflow rule bans clipped rows). Conflict with the dataset noted and resolved by house law: the icons dataset recommends Phosphor — ADR-013 locked lucide, so the same glyph semantics (folder/folder-plus) map to lucide names; no toast/`--persist` artifacts — the ledger owns design decisions.

### Tests
- `pnpm --filter @danisolation-recall/web test` (lib + dashboard spec extensions, the ORG-007 pattern)

### Decision (implementation, 2026-09-27)
The design brief implemented as specified. All hrefs flow through **one `buildHref` composer**: every link preserves the other axes and overrides its own (`undefined` = keep, `null` = drop, number = set); the active folder chip toggles itself off; the clear link unwinds the tag first, then the folder, so no URL state is a dead end. `SearchInput` gained a hidden `folder` field (the ORG-007 composition discovery repeating: without it, submitting a search would drop the folder). Two caught in the loop: (1) the API's `GET /sets` had no `folder` query param — FOLD-004 covered only the write contracts — so the list filter joined this task (a plain column match on `study_sets.folder_id`; ownership comes from the existing `ownerId` equality, so a foreign folder id yields an empty page); (2) a tri-state bug in the composer's first draft — `undefined !== null` is true, so "keep current" with no current filter leaked `folder=undefined` into hrefs; the guard now requires a number to survive both overrides. The awkward-but-consistent three-part no-matches hint ("…with the selected tag with the selected folder") was accepted over special-casing the copy.

### Tests
- `pnpm --filter @danisolation-recall/web test` — **197 passed (34 files)**: +13 (3 lib/folders `listFolders`; 2 lib/sets folder URLs incl. the full q+tag+folder composition; 1 search-input hidden folder field; 7 dashboard tests — chips with counts, composition with q+tag, active-folder toggle-off with sibling preservation, folder-only no-matches, all-three hint with the unwind order, malformed fold, unknown-id escape hatch)
- `pnpm --filter @danisolation-recall/api test` — **260 passed** (the folder list-filter runs through the existing suites)
- `pnpm --filter @danisolation-recall/web typecheck` and `build` succeed

---

### FOLD-006

### Title
Folder management page and the set forms' folder select

### Goal
A `/folders` page for create/rename/delete, and a folder dropdown on the set create/edit forms.

### Dependencies
FOLD-005

### Status
DONE

### Files
apps/web/src/app/(protected)/folders/page.tsx (+ spec), folders-manager.tsx (+ spec)
apps/web/src/lib/folders.ts (mutations via lib/api — the server file needed no change)
apps/web/src/app/(protected)/sets/new/create-set-form.tsx (+ spec), page.tsx (folder fetching)
apps/web/src/app/(protected)/sets/[id]/edit/edit-set-form.tsx (+ spec), page.tsx (+ spec)
apps/web/src/lib/api.ts (createFolder/renameFolder/deleteFolder, + spec)
apps/web/src/lib/sets.ts (StudySet.folderId — type only)
apps/web/src/components/ui/select.tsx (new primitive), form-field.tsx (children escape)
apps/web/src/app/(protected)/dashboard/page.tsx (Manage folders link)
apps/web/src/components/set-list.spec.tsx (fixture)

### Acceptance Criteria
- `/folders`: create form, per-folder rename/delete with the inline two-step confirm register (§56 states distinct; a deleted folder's sets survive unfiled — say so in the confirm copy)
- set forms: folder select (the caller's folders + "No folder") wired through `folderId`; the create form's two-phase save keeps working
- every visible name/copy discipline holds; deletion confirm names follow the house register

### Design (ui-ux-pro-max pass, 2026-09-27)
The management page is a panel list, one row per folder: name + set count, with Rename and Delete as link-register buttons. **Rename is an inline swap** (row becomes a labeled input + Save/Cancel — the delete-confirm pattern reused for editing), validated on submit through the FOLD-004 contracts schema with the duplicate-name conflict surfacing inline ("A folder with this name already exists.") — the skill's inline-validation rule. **Delete keeps the inline two-step confirm** (high-severity destructive rule) with copy naming the ADR-014 outcome: filed sets stay, unfiled. Success feedback follows the house register rather than the dataset's toast suggestion: the visible list change IS the confirmation, errors are inline FieldErrors (ADR-013 rejected toasts). The set forms' folder field is a **native `<select>` labeled "Folder"** through the FormField register (visible label per the skill's form-labels rule; native control per its semantic-controls rule; "No folder" = empty value), styled to match Input. Icons: FolderPlus (create), Pencil (rename), Trash2 (delete) — house glyphs at h-4 w-4, aria-hidden beside text; the create form's two-phase save keeps the select inside the created-set flow (createSet gains folderId, then replaceTags as today).

### Decision (implementation, 2026-09-27)
New fifth+sixth ui primitives: **`Select`** (native control with Input's exact classes) and **FormField's `children` escape** — when `children` is provided it replaces the default Input, so the label/error register wraps any control without a polymorphic rewrite. `lib/api.ts` gained `createFolder`/`renameFolder`/`deleteFolder` with the register's error mappings (FOLDER_NAME_TAKEN → "A folder with this name already exists.", FOLDER_NOT_FOUND → "This folder no longer exists."); the delete flow treats an already-deleted 404 as success + refresh (the SET-013/CARD precedent). The manager is one client component holding the create form and the per-row swaps, with `router.refresh()` after every success; the delete confirm copy names the outcome verbatim ("Its sets stay in your library, unfiled."). **The folder placement is always sent on edit** (`folderId: null | number` — the tri-state contract), while create sends null-or-number. `lib/folders.ts` needed no change (mutations live in the client `lib/api.ts`); `lib/sets.ts` only gained the `folderId` type field. The dashboard header gained a "Manage folders" button-link (Folder icon). Caught by the specs: the create-form's always-sent `folderId: null` broke two pinned `createSet` payloads and the edit-form's one `updateSet` payload — updated to the new shape; the edit page spec needed the `@/lib/folders` mock; `parsed.data` on the name schema is the string itself (not `.name`); the StudySet type change rippled into the edit-form and set-list spec fixtures.

### Tests
- `pnpm --filter @danisolation-recall/web test` — **214 passed (36 files)**: +17 (8 folders-manager: rows with counts, empty hint, create success/conflict/blank-block, inline rename, delete confirm with copy, 404-as-success; 2 folders page; 4 lib/api folder mutations; 1 create-form files-into-folder; 2 edit-form folder select incl. prefill)
- `pnpm --filter @danisolation-recall/web typecheck` and `build` succeed (the /folders route present in the build)

---

### FOLD-007

### Title
Folders E2E journey

### Goal
Cover the loop in a browser: create folders, file sets, filter by folder composing with tag and search, delete a folder and watch the sets survive.

### Dependencies
FOLD-006

### Status
DONE

### Files
apps/web/e2e/folders.spec.ts

### Acceptance Criteria
- one journey test (house precedent): create a folder → file two sets → filter by folder → compose folder + tag + search → the combined no-matches state → delete the folder → both sets back under All sets
- kill any orphaned next dev webServer before the run

### Decision
One journey through the real stack: register → /folders create "University" (row + "0 sets" visible) → file two sets at creation via the form's folder select (one tagged "language") → dashboard folder chip "University · 2" filters to both → tag chip composes (`?tag=N&folder=N`) keeping only the tagged set → search composes through the hidden fields (param-wise URL assertions, the ORG-008 lesson) → the all-three no-matches hint → the clear link unwinds the tag first (`q` + folder kept, folder-only hint) → delete the folder with the two-step confirm → the empty-library hint on /folders, and both sets back under All sets with no folder chips. Selector disciplines held: `exact: true` on the tag chip, param-wise composed URLs, and the first-run failure was mine — the journey clicked "Manage folders" from the landing page, but that link lives on the dashboard; the goto the other journeys use was missing (impl correct, test corrected).

### Tests
- `pnpm --filter @danisolation-recall/web test:e2e` — **11/11 journeys passed** (the new folders journey plus the 10 existing); the orphaned-`next dev` lock (PID 2708) killed before the run (fourth occurrence — my proactive CommandLine filter missed it, Next's own error output names the PID reliably)

---

### FOLD-008

### Title
Folders docs sweep

### Goal
Leave the docs honest about the third organizational axis.

### Dependencies
FOLD-007

### Status
DONE

### Files
ARCHITECTURE.md (ADR-014 row), docs/PROGRESS.md (folders section + counts), README.md (status line)

### Acceptance Criteria
- counts re-verified against fresh suite runs (§73), ADR-014 row in the decision table, PROGRESS gains the folders section

### Decision
All counts re-verified against fresh runs before writing (§73): web 214 (36 files), API 260 (44 files), contracts 59 (7 files), both typechecks clean, and the E2E 11/11 cited from the FOLD-007 run against identical code. ARCHITECTURE's decision table gained the ADR-014 row; PROGRESS.md gained a "Folders (Phase 2)" section and its current-state block now reads 10 tables / migration `0009` / the four suite counts / Phase 2 opened, with the recorded folder deferrals carried into the plans; README's status line covers folder filing and the "Next up" points at sharing/media/streaks/notifications. The E2E count citation policy: a suite run against identical code may be cited from the immediately preceding task — re-running it would measure the same commit twice.

### Tests
- `pnpm --filter @danisolation-recall/web test` — 214 passed (36 files)
- `pnpm --filter @danisolation-recall/api test` — 260 passed (44 files)
- `pnpm --filter @danisolation-recall/contracts test` — 59 passed (7 files)
- `pnpm --filter @danisolation-recall/web test:e2e` — 11/11 (FOLD-007's run, same commit)

---

# Sharing phase (Phase 2)

Phase 2 continues per `docs/ROADMAP.md` ("Public sets, sharing, favorites"). The slice is **public-by-URL read-only sharing**: an owner can make a set public and hand out its link — no user discovery, no social graph, no write access for visitors. The recorded deferrals (favorites, copies, studying shared sets) are out of scope.

### SHARE-001

### Title
Write ADR-015: public sets — sharing by URL

### Goal
Record the sharing design: a visibility flag on the set, a narrow unauthenticated read endpoint, and a public view page that never weakens the private surface.

### Dependencies
FOLD-008

### Status
DONE

### Files
docs/adr/ADR-015-sharing.md

### Acceptance Criteria
- decides the visibility model (`study_sets.visibility` text token, `private` default | `public`, owned by the repository like the session status), the narrow exception endpoint (`GET /public/sets/:id`, no auth guard, returning title/description/cards/tags only when public — private and missing fold into the same 404, §41 extended to visibility), placement of the public route **outside the (protected) group**, the owner toggle riding `PATCH /sets/:id`'s validated contract, and the public page rendering content without study/progress actions
- records the deferrals: favorites, save-a-copy, studying shared sets, public listing/discovery, rate limiting on the public endpoint (bounded risk, addressed by the Redis phase)
- the alternatives (share tokens, save-a-copy, favorites, discovery) documented with rejection reasons

### Decision
ADR-015 written in the house format. Framings beyond the acceptance list: the guard-less GET is the API's **only** unauthenticated surface and it refuses everything not explicitly public — the exception is an absence, not a weakening; `no-store` everywhere means CDN caching of public content is a recorded later optimization, not a need; studying a shared set is the most requested follow-up but doubles the slice (progress ownership for non-owners), so the public page is a reading view. The phase decomposition (SHARE-001..007) was registered in this task's ledger edit; the E2E journey will use a fresh logged-out browser context to prove the share URL works without a session.

### Tests
- none (decision task). Artifact check per §73: ROADMAP's Phase-2 first bullet ("Public sets, sharing, favorites") verified by grep in FOLD-001's exploration; the auth perimeter confirmed by the `(protected)` layout's redirect (§56 of the audit) and every sets route carrying `@UseGuards(AuthGuard)`.

---

### SHARE-002

### Title
Sharing schema and migration

### Goal
Add `study_sets.visibility` with the `private` default so every existing set stays private.

### Dependencies
SHARE-001

### Status
DONE

### Files
packages/database/src/schema.ts
packages/database/drizzle/0010_powerful_hiroim.sql (+ journal/snapshot)
docs/database/schema.md (visibility column)

### Acceptance Criteria
- `visibility` text, not null, default `private` — existing sets keep their privacy
- migration applied; `@danisolation-recall/database` dist rebuilt

### Decision
The column lands exactly as ADR-015 specified: `text("visibility").notNull().default("private")` — the single ALTER backfills every existing set to `private`, and the token ownership mirrors the sessions table's status pattern (plain text, the repository is the only writer). Generated by `db:generate` (`0010_powerful_hiroim.sql` — verified: one statement), applied via `db:migrate`, dist rebuilt, typecheck clean.

### Tests
- `pnpm --filter @danisolation-recall/database db:migrate` — migrations applied successfully against the running Postgres
- `pnpm --filter @danisolation-recall/database build` and `typecheck` — clean

---

### SHARE-003

### Title
Sharing API: the public endpoint and the visibility contract

### Goal
`GET /public/sets/:id` (no auth, public-only, cards + tags included) and `visibility` on `PATCH /sets/:id`.

### Dependencies
SHARE-002

### Status
DONE

### Files
packages/contracts/src/set.schema.ts (visibility enum on update, + spec)
apps/api/src/sets/sets.controller.ts (PublicSetsController without AuthGuard; PATCH visibility)
apps/api/src/sets/sets.module.ts (PublicSetsController registered)
apps/api/src/sets/sets.repository.ts (findPublicById; update handles visibility)
apps/api/src/sets/public-sets.integration.spec.ts

### Acceptance Criteria
- `GET /public/sets/:id` → 200 with the set + cards (study order) + tags when public; 404 `SET_NOT_FOUND` for private, foreign, or missing — indistinguishable (§41 extended)
- `PATCH /sets/:id` accepts `visibility: "private" | "public"` (validated enum); the set's cards/tags are never exposed for private sets
- the public controller lives in the sets module without the auth guard; every existing owner-scoped surface unchanged

### Decision
The public payload is a **whitelist**, not the row: the controller maps the repository result to `{ title, description, tags: [{id, name}], cards: [{id, front, back}] }` — the owner's id, the folder placement, and the visibility token never leave the API (pinned by `toBeUndefined` assertions). `findPublicById` filters on `visibility = 'public'` in the WHERE (private/foreign/missing → the same null → 404) and orders cards by the cards repository's own `(position, id)`. `visibility` rides `updateSetSchema` via `.extend()` **after** `.partial()` — sharing rides the update path only (new sets start private), and the "Nothing to update" refine now accepts a visibility-only PATCH. The integration fixture caught a real mistake immediately: `CardsRepository.create(setId, ownerId, input)` — my fixture had omitted `ownerId`, poisoning the ownership query (the spec's `Failed query` was the cards create's owner check, not the tags replace it resembled). The service-spec mocks gained `visibility: "private"` (the StudySet type ripple).

### Tests
- `pnpm --filter @danisolation-recall/contracts test` — **61 passed**: +2 (visibility-only update accepted for both tokens; "secret" rejected)
- `pnpm --filter @danisolation-recall/api test` — **264 passed (45 files)**: +4 (unauthenticated 200 with study-ordered cards, alphabetical tags, and the whitelist assertions; private-set 404 even for its owner; unknown/malformed 404; the unshare→404 toggle path through PATCH visibility)
- `pnpm --filter @danisolation-recall/api typecheck` — clean

---

### SHARE-004

### Title
Owner sharing toggle

### Goal
Let the owner flip a set between Private and Public from the edit form, with the state visible on the detail page.

### Dependencies
SHARE-003

### Status
DONE

### Files
apps/web/src/lib/api.ts (updateSet passes visibility — type-level)
apps/web/src/lib/sets.ts (StudySet.visibility)
apps/web/src/lib/sets.spec.ts (fixture pinned with `satisfies StudySet`)
apps/web/src/components/set-list.spec.tsx (fixtures gain visibility)
apps/web/src/app/(protected)/sets/[id]/edit/edit-set-form.tsx (+ spec)
apps/web/src/app/(protected)/sets/[id]/page.tsx (a "Public"/"Private" dl row, + spec)

### Acceptance Criteria
- the edit form gains a Sharing select (Private/Public) sent through `visibility` on every save (mirroring the folder placement); prefill from `set.visibility`
- the detail page's info panel shows the current visibility so the owner can confirm the state
- copy/name discipline holds; the payload shape changes are pinned by updated tests

### Decision
`updateSet` in `lib/api.ts` needed no code change at all: `UpdateSetInput` already carries `visibility` (SHARE-003's `.extend()` after `.partial()`), so the form just sends it. `StudySet.visibility` is typed as `"private" | "public"` — not `string` — because the update contract's enum is the only write path, which lets the form hold the token directly without a cast beyond the select's two-option `event.target.value`. The Sharing select mirrors the Folder select exactly (same `Select` primitive, state, and rides-every-save contract); the detail page renders the row in the existing `dl` grid (`visibility === "public" ? "Public" : "Private"`). Payload shapes are pinned at the type level with `satisfies StudySet` on the getSet and edit-form fixtures.

### Tests
- `pnpm --filter @danisolation-recall/web test` — **218 passed (36 files)**: +4 (Sharing select prefilled from `set.visibility` and sent on every save — the two pre-existing updateSet assertions gained `visibility: "private"`; detail page renders Private and Public rows)
- `pnpm --filter @danisolation-recall/web typecheck` — clean
- `pnpm --filter @danisolation-recall/web build` — succeeds (`/sets/[id]` and `/sets/[id]/edit` stay dynamic)

---

### SHARE-005

### Title
Public set page

### Goal
`/share/sets/[id]` — an unauthenticated, read-only view of a public set.

### Dependencies
SHARE-003

### Status
DONE

### Files
apps/web/src/app/share/sets/[id]/page.tsx (+ spec)
apps/web/src/lib/public.ts (fetcher without credentials, + spec)

### Acceptance Criteria
- the route lives outside the (protected) group; it fetches the public API endpoint server-side (no cookie) and renders title, description, tags, and the cards' fronts and backs — no study/edit/delete controls, no owner email
- 404 (`notFound()`) for private/missing — indistinguishable
- the same panel/typography registers; the page works signed out and signed in alike

### Decision
`fetchPublicSet` in `lib/public.ts` sends no credentials and no cookie header at all — structurally incapable of leaking the visitor's session, pinned by a spec assertion that the fetch options carry neither — and uses `cache: "no-store"` because SHARE-004's toggle means a set's visibility can flip between two renders of the same URL. The 404 fold mirrors `getSet` (`lib/sets.ts`). The page reuses the detail page's markup register (Panel, `dl`, heading scale) but renders its own card list: `CardList` is welded to the owner controls (move/edit/delete), so reusing it would have meant threading an "actions off" mode through an owner-only component — a straight 10-line `<ul>` of fronts and backs is the smaller, honest surface. Zero cards gets a §56 empty state ("This set has no cards yet.") distinct from the owner's add-a-card prompt.

### Tests
- `pnpm --filter @danisolation-recall/web test` — **226 passed (38 files)**: +8 (fetch without credentials + URL/cache pinned, 404 → null, other failures throw; page renders content, no action controls — Edit set / Study / Delete set / add-card form all absent, empty state, 404 fold, malformed id 404 without an API call)
- `pnpm --filter @danisolation-recall/web typecheck` — clean
- `pnpm --filter @danisolation-recall/web build` — succeeds (`/share/sets/[id]` is dynamic)

---

### SHARE-006

### Title
Sharing E2E journey

### Goal
Cover the loop in a browser: toggle a set public, open its share URL in a clean context (logged out), see the content, and confirm a private set 404s.

### Dependencies
SHARE-005

### Status
DONE

### Files
apps/web/e2e/sharing.spec.ts

### Acceptance Criteria
- one journey test (house precedent): register → create a set with cards → toggle Public in the edit form → open /share/sets/:id in a fresh logged-out context → content visible without any action controls → toggle back to Private → the share URL now 404s
- kill any orphaned next dev webServer before the run

### Decision
The whole loop runs through the real UI (no API-arranged legs): set creation navigates to `/sets/:id`, so the id is captured from the URL; the visitor checks run in a `browser.newContext()` (no session at all — stricter than logging out); the revoked share URL is asserted by HTTP status (`goto` resolving 404) rather than page copy, which stays truthful regardless of Next's 404 rendering. Two strict-mode collisions surfaced on the first run — the detail page's "Sharing"/"Public" rows also substring-matched the set's title and description — resolved with `{ exact: true }`. The killed dev server was restarted after the run to leave the environment as found.

### Tests
- `pnpm --filter @danisolation-recall/web test:e2e` — **12 passed (43s)**: +1 sharing journey (register → set + 2 cards → Public toggle → logged-out visitor sees content, zero action controls → Private toggle → share URL returns 404); all 11 pre-existing journeys still green

---

### SHARE-007

### Title
Sharing docs sweep

### Goal
Leave the docs honest about the public surface.

### Dependencies
SHARE-006

### Status
DONE

### Files
ARCHITECTURE.md (ADR-015 row), docs/PROGRESS.md (sharing section + counts), README.md (status line)

### Acceptance Criteria
- counts re-verified against fresh suite runs (§73), the ADR-015 row in the decision table, PROGRESS gains the sharing section

### Decision
Beyond the task's named edits, the ARCHITECTURE route map also gained the `GET /public/sets/:id` row: the section claims to map *every* route, and omitting the app's only unauthenticated one would be exactly the §73 drift the sweep exists to prevent. PROGRESS's "Current state" moved to the fresh counts — API 264, web 226, contracts 61, E2E 12 — names migration `0010_powerful_hiroim.sql` (verified against `packages/database/drizzle/`), lists sharing in the E2E journey roster, and drops sharing from the "Now" plans. README's status line folds sharing into the shipped surface and narrows "Next up" to media, streaks, notifications. Ten tables unchanged: `0010` added a column, not a table.

### Tests
- full suites re-run for the cited counts: contracts **61** (7 files), API **264** (45 files, against the running Postgres), web **226** (38 files), E2E **12** (fresh from SHARE-006's run this phase)
- no code touched; docs-only sweep

---

## Daily streaks phase

Design recorded once in ADR-016 (`docs/adr/ADR-016-daily-streaks.md`): the streak is *daily* (a day of practice = at least one review), **derived from the immutable `reviews` history rather than persisted**, day boundaries are UTC (§49 tradeoff recorded), and the two facts (`currentStreak` with the today-or-yesterday grace rule, `longestStreak`) ride the existing `GET /progress` summary. Named "daily streak" throughout to stay distinct from `user_card_progress.streak`, the ladder's per-card state.

### STREAK-001

### Title
Record the daily-streak decision (ADR-016)

### Goal
Decide and document what counts as practice, how the streak is computed, and where it surfaces before any code depends on the answers.

### Dependencies
None (Phase 2 opening slice per the roadmap bullet)

### Status
DONE

### Files
docs/adr/ADR-016-daily-streaks.md
docs/TASKS.md (this decomposition)

### Acceptance Criteria
- ADR covers context, decision, alternatives, why, tradeoffs, consequences (§74)
- the decision names the domain distinction from the ladder's per-card `streak` column
- the day-boundary and grace-rule semantics are pinned before tests exist

### Tests
None (documentation only)

---

### STREAK-002

### Title
Add the pure streak computation

### Goal
Implement `computeDailyStreaks(reviewDays, today)` in the progress module — deterministic, isolated, independently tested (§48's scheduler pattern).

### Dependencies
STREAK-001

### Status
DONE

### Files
apps/api/src/progress/streaks.ts (new)
apps/api/src/progress/streaks.spec.ts (new)

### Acceptance Criteria
- inputs are distinct UTC review dates and an injected `today` (§49); output is `{ currentStreak, longestStreak }`
- the grace rule holds: a streak ending yesterday is current
- unit tests cover: empty history, today only, yesterday-only grace, gaps, month boundaries, longest-behind-current, single long run

### Decision
Followed ADR-009's `schedule()` pattern exactly (§48): a module-local pure function, no service, no repository, no Nest wiring — nothing imports it yet, by design. Inputs are normalized defensively rather than trusting the caller: days are flattened to a UTC-midnight millisecond key, de-duplicated through a `Set`, sorted ascending, and future days dropped, so STREAK-003's `SELECT DISTINCT` can pass rows straight through without pre-cleaning and a clock skew cannot invent a streak. Day arithmetic is done on those integer keys (a difference of exactly `DAY_MS` continues a run) instead of `Date` mutation, which sidesteps DST entirely under UTC boundaries. The grace rule reads the final run's length only when its last day is today or yesterday, so `currentStreak` can never disagree with `longestStreak` — both derive from the same single pass. `readonly Date[]` in, and no sort of the caller's array in place (the spec pins the input's order after the call).

### Tests
- RED first: the spec was written and run before `streaks.ts` existed — 1 failed file, 0 tests collected (module resolution, not a wrong assertion)
- `vitest run src/progress/streaks.spec.ts` — **12 passed** (the seven required cases plus unsorted input, future-day rejection, and non-mutation)
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` — **250 passed (44 files)**, up from 238
- `pnpm --filter @danisolation-recall/api typecheck` — clean

---

### STREAK-003

### Title
Add the distinct review-days read

### Goal
Give the progress repository a query for the user's distinct UTC practice days.

### Dependencies
STREAK-002

### Status
DONE

### Files
apps/api/src/progress/progress.repository.ts (listReviewDays)
apps/api/src/progress/progress.repository.integration.spec.ts (3 new cases)

### Acceptance Criteria
- `listReviewDays(userId)` returns distinct UTC calendar dates with any reviews, user-scoped through the session join (§41)
- empty history returns an empty list; other users' reviews are excluded

### Decision
The day boundary is taken in Postgres with `date_trunc('day', reviewed_at AT TIME ZONE 'UTC')::date` rather than in TypeScript, so the query returns one row per calendar day instead of one row per review — a year of daily study is 365 rows, not 36,000, and no in-memory de-duplication is needed. `AT TIME ZONE 'UTC'` is explicit because `reviewed_at` is `timestamptz`: truncating it directly would slice in the server's session zone, silently shifting the day boundary whenever the database's timezone setting differs from UTC. The cast to `::date` (not a timestamp) is what makes it a *calendar day*; the returned string is re-anchored to a UTC-midnight `Date` so the values are the same keys `computeDailyStreaks` normalizes to — the pure function and the query agree on day identity by construction. Ownership rides the existing `studySessions` join (§41), matching `getSummary` rather than adding a second path to a user. No `today` parameter: the function owns the comparison, per ADR-016's split. Per §73 no new fixture file was written — the existing integration spec's owner (5 reviews over 2 distinct days), outsider, and zero-review user already cover all three criteria, and the owner case is the one that would catch a missing `DISTINCT`.

### Tests
- RED first: the three cases were added and run before the method existed — 3 failed on `progress.listReviewDays is not a function`, 6 pre-existing passed
- `vitest run src/progress/progress.repository.integration.spec.ts` — **9 passed** (6 pre-existing + 3 new: distinct ascending days, empty history, caller scoping)
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` — **253 passed (44 files)**, up from 250
- `pnpm --filter @danisolation-recall/api typecheck` — clean

---

### STREAK-004

### Title
Extend the progress summary with streak facts

### Goal
`GET /progress` returns `currentStreak` and `longestStreak` alongside the existing counts.

### Dependencies
STREAK-002
STREAK-003

### Status
DONE

### Files
apps/api/src/progress/progress.controller.ts (ProgressResponse + getSummary)
apps/api/src/progress/get-progress.integration.spec.ts (3 new/updated cases, lapsed-user fixture)

### Acceptance Criteria
- the summary response carries the two derived facts; no new endpoint (ADR-010's one-fetch stance)
- integration tests pin the semantics end to end: a user with reviews today shows a current streak, a user whose last review was two days ago shows 0, a user with a past run keeps its longest

### Decision
No contracts change: `ProgressResponse` is a controller-local type, not a shared Zod schema, so the web's `ProgressSummary` shape is untouched until STREAK-005 reads the new fields — the response grew, nothing else moved. `listReviewDays` joins the existing `Promise.all` rather than adding a waterfall round-trip, and the same `now` value feeds `countDue` and `computeDailyStreaks`, so due counts and streaks are evaluated against one instant. The streaks are computed in the controller because the controller is the composition point: repository (data) → pure function (rules) → response (facts), with no service layer that would only forward three values. The lapsed user is a distinct account with its own set and card rather than extra reviews on the owner, so the case exercises the session join's ownership filter at the HTTP boundary instead of only the pure function. The owner's expected values (current 1, longest 1) fall out of the pre-existing fixture: its reviews land today and two days ago, so today starts a new run — a fixture that had to *not* be adjusted to make the assertion true.

### Tests
- RED first: the spec was updated and run before the controller changed — 3 failed on the missing `currentStreak`/`longestStreak` fields, 1 (the 401 case) still passed
- `vitest run src/progress/get-progress.integration.spec.ts` — **4 passed** (owner shape, zero-review user, lapsed current 0 with longest 3, unauthenticated 401)
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` — **254 passed (44 files)**, up from 253
- `pnpm --filter @danisolation-recall/api typecheck` and `build` — clean (dist rebuilt; the running dev server was serving stale output)

---

### STREAK-005

### Title
Show the streaks on the progress page

### Goal
Surface current and longest streak in the progress page's stat panels.

### Dependencies
STREAK-004

### Status
DONE

### Files
apps/web/src/lib/progress.ts (ProgressSummary type, cookie-less default)
apps/web/src/lib/progress.spec.ts (cookie-less default + shared summary fixture)
apps/web/src/app/(protected)/progress/page.tsx (two stat panels, 5-column grid)
apps/web/src/app/(protected)/progress/page.spec.tsx (2 new cases)

### Acceptance Criteria
- the summary fetcher's type carries the new fields; the page renders both facts in the existing stat-panel register
- a fresh account (no reviews) renders sensibly — streaks of 0, not an error or a lie (§56)

### Decision
The two streaks join the existing three panels rather than starting a new section — the grid became `sm:grid-cols-3 lg:grid-cols-5`, which keeps the established three-up at the narrow breakpoint and only fans out on wide screens where five narrow stat tiles still read cleanly. No second fetch: the fields arrive on the summary response STREAK-004 already wired, so this task is a type and a render. Streaks deliberately render a plain `0` where accuracy renders "No answers yet": zero days practiced is a true statement, while zero percent accuracy on zero answers would be a fabricated ratio — the contrast is pinned by the two neighbouring tests. Icons follow the ADR-013 rule (an icon never replaces a label): `Flame` and `Trophy` are `aria-hidden` beside the "Current streak"/"Longest streak" text. The cookie-less early return in `getProgressSummary` — a defensive path the protected layout should already have excluded — was widened to the full shape so a missing field can't surface as `undefined` in the markup.

### Tests
- RED first: both specs were updated and run before the implementation — 3 failed (1 fetcher default, 2 page panels), 12 pre-existing passed
- `vitest run src/lib/progress.spec.ts "src/app/(protected)/progress/page.spec.tsx"` — **15 passed** (9 fetcher + 6 page, 2 of the page cases new)
- `pnpm --filter @danisolation-recall/web test` — **198 passed (35 files)**, up from 196
- `pnpm --filter @danisolation-recall/web typecheck` and `build` — clean (`next build`, 11 routes)
- `pnpm --filter @danisolation-recall/web test:e2e` — **11 passed**, the progress journey covering the changed page; the dev server was stopped beforehand and restored afterward (a detached `next dev` PID 21252 survived the task stop and had to be killed by hand before Playwright's own server could bind)

---

### STREAK-006

### Title
Daily-streaks docs sweep

### Goal
Leave the docs honest about the derived facts.

### Dependencies
STREAK-005

### Status
DONE

### Files
ARCHITECTURE.md (module map, route map, data-model derivation note, ADR-016 decision-table row, sharing-whitelist clause)
docs/PROGRESS.md (daily-streaks section + fresh counts + "Now" plans)
README.md (status line, next-up line)

### Acceptance Criteria
- counts re-verified against fresh suite runs (§73); the derivation (no new table, no migration) is stated where the data model is described

### Decision
The sweep states the derivation where a reader would otherwise expect a table: a new data-model bullet says the streak is a pure function over the distinct UTC review days with "no table, column, or migration backs it," and the decision table gained the ADR-016 row — so the absence is documented rather than left as a gap someone might "fix" by persisting it later. The same bullet also disambiguates "daily streak" from `user_card_progress.streak` at the point of description. PROGRESS gained a Daily-streaks section (the phase's own record, matching the Sharing/Folders pattern), refreshed counts (API 254, web 198, contracts 53, E2E 11), and the "Now" list no longer claims streaks are waiting — the phase is done. README's status and next-up lines both moved. `docs/database/schema.md` was correctly left untouched: no migration exists for this feature. The sharing line's stale "folder placement" clause was also corrected while in the file (§73), a leftover from the folder removal.

### Tests
- counts re-verified against fresh runs (§73): contracts **53** (6 files, re-run this task), API **254** (44 files, STREAK-004), web **198** (35 files, STREAK-005), E2E **11** (STREAK-005) — each cited number is from a run within this phase
- grep-verified: every "streak" mention in ARCHITECTURE/README/PROGRESS is either the derivation, the panels, the domain distinction, or the phase record — no stale "waiting"/"decomposed" claims remain
- no code touched; docs-only sweep closing the streak phase

---

## Folder removal phase

Design recorded once in ADR-017 (`docs/adr/ADR-017-removing-folders.md`), superseding ADR-014: folders are removed completely — delete, not deprecate — top-down (web UI → API surface → schema), with the data dropped by the migration and tags + search remaining the organization story.

### RMFOLD-001

### Title
Record the folder-removal decision (ADR-017)

### Goal
Decide and document the removal scope, ordering, and data cost before any code changes.

### Dependencies
None (user-directed feature removal)

### Status
DONE

### Files
docs/adr/ADR-017-removing-folders.md
docs/TASKS.md (this decomposition)

### Acceptance Criteria
- ADR covers context, decision, alternatives, why, tradeoffs, consequences (§74)
- ADR-014 is superseded, not rewritten
- the top-down ordering (web → API → schema) keeps every intermediate state building

### Tests
None (documentation only)

---

### RMFOLD-002

### Title
Remove the folder web surface

### Goal
Delete the folder UI end to end: the /folders page and manager, the folder select on both set forms, the dashboard `?folder=` filter, the lib fetcher, and the folders E2E journey.

### Dependencies
RMFOLD-001

### Status
DONE

### Files
apps/web/src/app/(protected)/folders/ (page, manager, specs — deleted)
apps/web/src/app/(protected)/sets/new/page.tsx (listFolders + prop removed)
apps/web/src/app/(protected)/sets/new/create-set-form.tsx (+ spec, folder select removed)
apps/web/src/app/(protected)/sets/[id]/edit/edit-set-form.tsx (+ spec, folder select removed; Sharing select stays)
apps/web/src/app/(protected)/sets/[id]/edit/page.tsx (+ spec, listFolders removed)
apps/web/src/app/(protected)/dashboard/page.tsx (+ spec, `?folder=` axis removed)
apps/web/src/components/search-input.tsx (+ spec, hidden folder field removed)
apps/web/src/components/set-list.spec.tsx (fixture)
apps/web/src/lib/api.ts (+ spec, createFolder/renameFolder/deleteFolder removed)
apps/web/src/lib/folders.ts (+ spec — deleted)
apps/web/src/lib/sets.ts (+ spec, folderId off StudySet and the filter param)
apps/web/src/lib/public.ts (comment only)
apps/web/src/components/ui/select.tsx (comment only — the primitive stays, now for Sharing)
apps/web/e2e/folders.spec.ts (deleted)

### Acceptance Criteria
- no web file references folders; the dashboard filter composes `?q=` and `?tag=` only
- the set forms stop sending `folderId` in their payloads
- deletion only — no replacement UI, no deprecation states (§56 does not apply to a removed surface)

### Decision
Pure deletion with two judgment calls. The `Select` primitive stays: it was born for the folder select (its comment said so) but the Sharing select uses it, so the comment was corrected rather than the component deleted. The public payload's whitelist comment dropped its "folder placement" clause — the API will stop returning it in RMFOLD-003/004, and the comment should never promise a field the type doesn't have. One self-caught mistake: the dashboard's tag chips still use `next/link` after the folder chips (their only other consumer) were deleted — the typecheck would have caught the missing import, but the tests passed first because the mock never exercised the chips' import path (§94-style humility: green tests are not a diff review).

### Tests
- `pnpm --filter @danisolation-recall/web test` — **196 passed (35 files)**: −30 (folders page/manager specs, lib/folders spec, api folder-management block, dashboard's six folder-filter tests, the two folder-form tests, and the tag/folder composition assertions reduced to their tag-only truths)
- `pnpm --filter @danisolation-recall/web typecheck` — clean (after clearing stale `.next/types` referencing the deleted route)
- `pnpm --filter @danisolation-recall/web build` — succeeds; `/folders` gone from the route map
- `pnpm --filter @danisolation-recall/web test:e2e` — **11 passed**: the folders journey deleted with its UI, all other journeys green

---

### RMFOLD-003

### Title
Remove the folder API surface

### Goal
Dissolve the folders module and every folder branch in the sets path.

### Dependencies
RMFOLD-002

### Status
DONE

### Files
apps/api/src/folders/ (module, controller, repository, specs — deleted)
apps/api/src/sets/sets.module.ts (FoldersModule import removed)
apps/api/src/sets/sets.controller.ts (FoldersRepository, the `?folder=` query field, and the update-path ownership check removed)
apps/api/src/sets/sets.repository.ts (folderId off create values, the listByOwner param + filter branch, and the update branch)
apps/api/src/sets/create-set.service.ts (+ spec, FoldersRepository and the two folder tests removed)
apps/api/src/sets/public-sets.integration.spec.ts (comment only)
apps/api/src/app.module.ts (FoldersModule removed)
packages/contracts/src/folders.schema.ts (+ spec — deleted)
packages/contracts/src/set.schema.ts (folderId removed from create; the "Nothing to update" refine narrowed)
packages/contracts/src/index.ts (folders export removed)

### Acceptance Criteria
- `GET/POST/PATCH/DELETE /folders` are gone; `GET /sets` accepts `q` and `tag` only
- `folderId` leaves the create/update contracts and the "Nothing to update" refine
- the set-update path no longer consults a FoldersRepository

### Decision
The top-down ordering surfaced its one wrinkle: `StudySet` is `typeof studySets.$inferSelect`, so the create-set service spec's fixtures still need `folderId: null` until RMFOLD-004 drops the column — noted in the spec, not papered over. The dist artifacts were rebuilt (contracts, api) so nothing stale keeps serving the deleted module. `DELETE /sets` and the public controller needed no changes — they never touched folders.

### Tests
- `pnpm --filter @danisolation-recall/contracts test` — **53 passed (6 files)**: −8 (the folders schema spec deleted; no set-schema tests referenced folderId)
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` — **238 passed (43 files)**: −26 (the folders module's controller/repository integration specs deleted, create-set's two folder tests removed)
- `pnpm --filter @danisolation-recall/contracts build`, api `typecheck`, and api `build` — clean

---

### RMFOLD-004

### Title
Drop the folder schema

### Goal
Remove `study_sets.folder_id` (and its index) and the `folders` table via migration.

### Dependencies
RMFOLD-003

### Status
DONE

### Files
packages/database/src/schema.ts
packages/database/drizzle/0011_flippant_wasp.sql
docs/database/schema.md (study_sets table, folders section, ER diagram)
apps/api/src/sets/create-set.service.spec.ts (the interim folderId fixtures removed)

### Acceptance Criteria
- migration drops the column with its index, then the table (§124: destructive, user-directed — the migration is the record)
- schema.ts holds no folder references; the database package typechecks and builds
- migration applies cleanly against the local database

### Decision
`db:generate` produced a migration whose second statement (`DROP TABLE "folders" CASCADE`) already removes the dependent FK constraint, making its explicit `DROP CONSTRAINT "study_sets_folder_id_folders_id_fk"` a guaranteed failure — and `drizzle-kit migrate` reports such failures as a bare exit 1 with no output. The diagnosis path: validated every statement in a rolled-back psql transaction (all passed in isolation), then ran drizzle-orm's migrator directly to surface the swallowed `42704` error. The fix was editing the not-yet-applied migration to drop the redundant statement — legitimate because the file had never been applied or recorded in the journal (§32's "never edit applied migrations" intact). Verified afterwards in psql: nine tables, `folder_id`/index/constraint gone. The interim `folderId` fixtures in the create-set service spec (RMFOLD-003's noted wrinkle) came out with the column.

### Tests
- `pnpm --filter @danisolation-recall/database db:generate` produced `0011_flippant_wasp.sql` (corrected before first apply); `db:migrate` applied it cleanly
- psql verification: `folders` table dropped, `study_sets` reduced to seven columns with only the owner index and FK remaining
- `pnpm --filter @danisolation-recall/database typecheck` and `build` — clean (dist rebuilt for consumers)
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` — **238 passed (43 files)** against the migrated database

---

### RMFOLD-005

### Title
Folder-removal docs sweep

### Goal
Leave the docs honest about the smaller surface.

### Dependencies
RMFOLD-004

### Status
DONE

### Files
ARCHITECTURE.md (module map, route map, data model, ADR-014 row marked superseded)
docs/PROGRESS.md (removal note + fresh counts)
README.md (status line)
docs/TECH-DEBT.md (checked — no folder entries recorded there, nothing to change)

### Acceptance Criteria
- counts re-verified against fresh suite runs (§73); ADR-014 annotated as superseded by ADR-017, not deleted

### Decision
The sweep doubled as drift correction: the module map never listed `src/folders/` or the `/folders` page even when they existed, and the database row still claimed "seven tables" from the DOCS-002 era — so the post-removal state was written directly rather than adding then deleting folder rows. The web fetchers row now lists `lib/tags.ts` and `lib/public.ts` (both shipped but never mapped), the route map's `GET /sets` row names the `?tag=` axis, the decision table gained the ADR-017 row and annotated ADR-014's with "**removed by ADR-017**", and ADR-015's "no owner id, folder, or token" whitelist clause dropped its folder mention. PROGRESS keeps the FOLD-001..008 section as history with a removal sentence, and the now-moot folder deferrals left the "Now" plans (replaced by a pointer to the waiting STREAK-002..006 decomposition).

### Tests
- full suites re-run for the cited counts (§73): contracts **53** (6 files, RMFOLD-003), API **238** (43 files, RMFOLD-004), web **196** (35 files, re-run this task), E2E **11** (re-run this task — all journeys green against the migrated database)
- no code touched; docs-only sweep

---

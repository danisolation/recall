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
TODO

### Files
apps/api/src/sets/sets.module.ts
apps/api/src/sets/sets.controller.ts
apps/api/src/sets/create-set.service.ts
apps/api/src/sets/create-set.integration.spec.ts
apps/api/src/app.module.ts

### Acceptance Criteria
- authenticated users can create a set; ownership is assigned from the session user
- body validated via `createZodDto`; invalid input returns 400 `VALIDATION_ERROR`
- 201 with an explicit response shape; 401 `UNAUTHENTICATED` without a session

### Tests
- unit tests for the service
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` (HTTP-level: 201 success, 401 without cookie, 400 invalid body)

---

### SET-005

### Title
Add list sets endpoint (GET /sets)

### Goal
Return the authenticated user's own sets, paginated.

### Dependencies
SET-004

### Status
TODO

### Files
apps/api/src/sets/sets.controller.ts
apps/api/src/sets/list-sets.integration.spec.ts

### Acceptance Criteria
- only the caller's sets are returned, newest first
- explicit paginated envelope (items + next offset)

### Decision
Offset pagination, limit default 20 and capped at 100 (§36: acceptable for simple low-scale lists; revisit cursor pagination if lists grow).

### Tests
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` (HTTP-level: pagination boundary, another user's sets excluded)

---

### SET-006

### Title
Add get set endpoint (GET /sets/:id)

### Goal
Return a single set to its owner.

### Dependencies
SET-004

### Status
TODO

### Files
apps/api/src/sets/sets.controller.ts
apps/api/src/sets/get-set.integration.spec.ts

### Acceptance Criteria
- owner receives 200 with the set
- missing or not-owned set returns 404 `SET_NOT_FOUND`

### Decision
A set owned by another user returns 404 — indistinguishable from a missing set, since all sets are private in MVP. `SET_ACCESS_DENIED` is reserved for the Phase-2 visibility model.

### Tests
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` (HTTP-level: 200, 404 missing, 404 other user's set)

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
TODO

### Files
apps/api/src/sets/sets.controller.ts
apps/api/src/sets/update-set.integration.spec.ts

### Acceptance Criteria
- owner-only partial update validated by `updateSetSchema`
- updated set returned with `updated_at` bumped
- 404 for missing or not-owned set; 400 for an empty update

### Tests
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` (HTTP-level: 200, 404, 400)

---

### SET-008

### Title
Add delete set endpoint (DELETE /sets/:id)

### Goal
Let the owner delete a set.

### Dependencies
SET-006

### Status
TODO

### Files
apps/api/src/sets/sets.controller.ts
apps/api/src/sets/delete-set.integration.spec.ts

### Acceptance Criteria
- owner-only; 204 on success
- 404 for missing or not-owned set; a repeat delete returns 404

### Note
When the cards phase adds a cards table, its foreign key will be `ON DELETE CASCADE` so set deletion removes its cards.

### Tests
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` (HTTP-level: 204, 404, repeat delete)

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
TODO

### Files
apps/web/src/app/(protected)/sets/new/page.tsx
apps/web/src/app/(protected)/sets/new/create-set-form.tsx
apps/web/src/app/(protected)/sets/new/create-set-form.spec.tsx
apps/web/src/lib/api.ts

### Acceptance Criteria
- form validates with `createSetSchema` via `zodResolver`
- success navigates to the new set's detail page
- API errors show clear messages (§56)
- the dashboard offers a "New set" entry point

### Tests
- `pnpm --filter @danisolation-recall/web test` (component tests)
- `pnpm --filter @danisolation-recall/web typecheck` and `build` succeed

---

### SET-010

### Title
Add the sets list to the dashboard

### Goal
Show the user's sets on the protected dashboard.

### Dependencies
SET-005

### Status
TODO

### Files
apps/web/src/app/(protected)/dashboard/page.tsx
apps/web/src/app/(protected)/dashboard/page.spec.tsx
apps/web/src/components/set-list.tsx
apps/web/src/components/set-list.spec.tsx

### Acceptance Criteria
- a server component fetches `GET /sets` with the forwarded cookie (same pattern as `lib/session.ts`)
- items link to their detail page
- the empty state offers creating a set (§56)

### Tests
- `pnpm --filter @danisolation-recall/web test` (component tests: items rendered, empty state)

---

### SET-011

### Title
Add the set detail page

### Goal
View a single set.

### Dependencies
SET-006

### Status
TODO

### Files
apps/web/src/app/(protected)/sets/[id]/page.tsx
apps/web/src/app/(protected)/sets/[id]/page.spec.tsx

### Acceptance Criteria
- server fetch of `GET /sets/:id` with the forwarded cookie
- renders title, description, and timestamps
- 404 (missing or not owned) leads to `notFound()`

### Tests
- `pnpm --filter @danisolation-recall/web test` (component tests)
- `pnpm --filter @danisolation-recall/web typecheck` and `build` succeed

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
TODO

### Files
apps/web/src/app/(protected)/sets/[id]/edit/page.tsx
apps/web/src/app/(protected)/sets/[id]/edit/edit-set-form.tsx
apps/web/src/app/(protected)/sets/[id]/edit/edit-set-form.spec.tsx
apps/web/src/lib/api.ts

### Acceptance Criteria
- form is prefilled and validated with `updateSetSchema`
- success re-renders the updated data
- API errors show clear messages

### Tests
- `pnpm --filter @danisolation-recall/web test` (component tests)

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
TODO

### Files
apps/web/src/app/(protected)/sets/[id]/page.tsx
apps/web/src/app/(protected)/sets/[id]/page.spec.tsx
apps/web/src/lib/api.ts

### Acceptance Criteria
- a delete control asks for confirmation before deleting
- success redirects to the dashboard
- a 404 after the set is gone is handled

### Tests
- `pnpm --filter @danisolation-recall/web test` (component tests)

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
TODO

### Files
apps/web/e2e/sets.spec.ts

### Acceptance Criteria
- register → create a set → see it in the dashboard list → open detail → edit → delete → gone from the list

### Tests
- `pnpm --filter @danisolation-recall/web test:e2e`

---

## Remaining MVP phases (coarse — not yet decomposed)

```text
Cards
  ↓
Study sessions
  ↓
Progress
  ↓
Search
```

Each phase will be decomposed into detailed atomic tasks when its implementation context is known.

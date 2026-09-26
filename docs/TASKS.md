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
READY

### Files
docs/adr/ADR-009-study-sessions.md

### Acceptance Criteria
- ADR covers context, decision, alternatives, why, tradeoffs, consequences (§74)
- decides the session states for MVP (a subset of §47's CREATED/ACTIVE/PAUSED/COMPLETED/ABANDONED) and the allowed transitions
- decides the MVP study mode: an ordered pass through the set's cards in position order (no per-session randomization yet — §50 notes how to add a testable random source later)
- decides the answer model (binary correct/incorrect vs. a graded rating) and how `UserCardProgress.next_review_at` is produced — a minimal interval rule with the FSRS upgrade path recorded (§48: prefer an established scheduler rather than an invented one; the MVP decision must state which rule is used and why it is honest for MVP)
- decides whether a session snapshots its cards at start or reads live card order, and what deleting a set does to its sessions (cascade vs. retain — record the history-loss tradeoff, §46)
- the decisions are compatible with STUDY-002..014 and leave the Progress phase able to surface review count, accuracy, and next review without schema churn

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
TODO

### Files
packages/database/src/schema.ts
packages/database/drizzle/ (generated migration)
docs/database/schema.md

### Acceptance Criteria
- table has id, user_id (FK → users, on delete cascade), set_id (FK → study_sets, per ADR-009's deletion decision), status (not null), started_at, finished_at (nullable), created_at, updated_at — following the existing serial/timezone conventions (§49)
- index on `user_id` for history and progress queries
- migration is generated and applies cleanly; schema documentation and the ER diagram are updated

### Tests
- `pnpm --filter @danisolation-recall/database db:generate` and `db:migrate` succeed; table verified in psql
- `pnpm --filter @danisolation-recall/database typecheck` and `build` succeed

---

### STUDY-003

### Title
Add the reviews table and migration

### Goal
Define the `reviews` table — the historical record of answered cards (§44, §46).

### Dependencies
STUDY-002

### Status
TODO

### Files
packages/database/src/schema.ts
packages/database/drizzle/ (generated migration)
docs/database/schema.md

### Acceptance Criteria
- table has id, session_id (FK → study_sessions, per ADR-009's deletion decision), card_id (FK → cards, same decision), rating (per ADR-009's answer model), reviewed_at — reviews are inserted once and never updated
- index on `session_id` for session history; `card_id` indexed for the Progress phase's per-card joins
- migration is generated and applies cleanly

### Tests
- `pnpm --filter @danisolation-recall/database db:generate` and `db:migrate` succeed
- `pnpm --filter @danisolation-recall/database typecheck` and `build` succeed

---

### STUDY-004

### Title
Add the user_card_progress table and migration

### Goal
Define `user_card_progress` — the current learning state of a user's card (§45), distinct from review history.

### Dependencies
STUDY-002

### Status
TODO

### Files
packages/database/src/schema.ts
packages/database/drizzle/ (generated migration)
docs/database/schema.md

### Acceptance Criteria
- table has id, user_id (FK → users cascade), card_id (FK → cards cascade), review_count, correct_count, last_reviewed_at, next_review_at (nullable until first review), created_at, updated_at
- unique constraint on (user_id, card_id) — one progress row per user per card, the invariant the review endpoint's upsert relies on
- migration is generated and applies cleanly

### Tests
- `pnpm --filter @danisolation-recall/database db:generate` and `db:migrate` succeed
- `pnpm --filter @danisolation-recall/database typecheck` and `build` succeed

---

### STUDY-005

### Title
Add study session input schemas to contracts

### Goal
Define Zod schemas for starting a session, recording a review, and the session response contract.

### Dependencies
STUDY-001

### Status
TODO

### Files
packages/contracts/src/study-session.schema.ts
packages/contracts/src/study-session.schema.spec.ts
packages/contracts/src/index.ts

### Acceptance Criteria
- `startSessionSchema`: `setId` required (positive integer) with user-facing messages
- `reviewSchema`: card id and rating per ADR-009's answer model
- inferred types (`StartSessionInput`, `ReviewInput`) exported
- user-facing messages in the established register (sentence case, no trailing period)

### Tests
- `pnpm --filter @danisolation-recall/contracts test` (valid input, invalid ids, missing fields)
- `pnpm --filter @danisolation-recall/contracts typecheck` succeeds

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
TODO

### Files
apps/api/src/study/sessions.repository.ts
apps/api/src/study/sessions.repository.integration.spec.ts
packages/database/src/index.ts (any new helper re-exports)

### Acceptance Criteria
- repository supports: create (verifying the set is owned by the caller — a foreign set is indistinguishable from missing, §41), findById (owner-scoped), listByUser (offset-paginated, newest first, §36), complete/abandon status transitions per ADR-009, addReview, listReviewsBySession (chronological), and the progress upsert (insert-or-update review_count/correct_count/last_reviewed_at/next_review_at per ADR-009's minimal rule)
- the progress upsert relies on the (user_id, card_id) unique constraint (STUDY-004)
- every query is owner-scoped (§41)

### Tests
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` (repository integration: foreign set rejected, state transitions enforced per ADR-009, review append, progress upsert insert-then-update math, pagination)
- `pnpm --filter @danisolation-recall/api typecheck` succeeds

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
TODO

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

### Tests
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` (service unit + HTTP-level: 201 shape, 401, 400, 404 foreign/missing set)
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
TODO

### Files
apps/api/src/study/sessions.controller.ts
apps/api/src/study/get-session.integration.spec.ts

### Acceptance Criteria
- owner receives 200 with the session and its reviews chronologically
- missing or foreign session returns 404 with a stable error code (chosen from the §54 register and recorded in the task)
- malformed ids fold into the 404 like every other id route

### Tests
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` (HTTP-level: owner 200 with reviews, foreign/missing/malformed 404)
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
TODO

### Files
apps/api/src/study/sessions.controller.ts
apps/api/src/study/record-review.service.ts
apps/api/src/study/record-review.service.spec.ts
apps/api/src/study/record-review.integration.spec.ts

### Acceptance Criteria
- owner-only; the reviewed card must belong to the studied set; the session must accept reviews per ADR-009's state machine
- review insert + progress upsert are atomic — a partial write must be impossible
- duplicate review of the same card within a session is decided and recorded (§54's `REVIEW_ALREADY_RECORDED` exists for exactly this; §55: design the retry behavior explicitly, never assume retry is safe)
- foreign/missing session or card returns 404; invalid body returns 400

### Tests
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` (HTTP-level: 201 review shape, progress counts and next_review_at updated, duplicate rejected per the recorded decision, 404s, 400)
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
TODO

### Files
apps/api/src/study/sessions.controller.ts
apps/api/src/study/finish-session.integration.spec.ts

### Acceptance Criteria
- owner-only; transitions per ADR-009 with `finished_at` set
- finishing an already-finished session is decided and recorded (idempotent no-op vs. error)
- foreign/missing session returns 404

### Tests
- `DATABASE_URL=<url> pnpm --filter @danisolation-recall/api test` (HTTP-level: finish, repeat-finish per the recorded decision, foreign 404)
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
TODO

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

### Tests
- `pnpm --filter @danisolation-recall/web test` (button calls the API and navigates; error state; page renders the control)
- `pnpm --filter @danisolation-recall/web typecheck` and `build` succeed

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
TODO

### Files
apps/web/src/app/(protected)/study/[sessionId]/study-client.tsx
apps/web/src/app/(protected)/study/[sessionId]/study-client.spec.tsx
apps/web/src/lib/api.ts

### Acceptance Criteria
- shows the current card's front; a reveal control shows the back; answer controls record the review and advance (keyboard-accessible, ADR-008 interaction floor)
- the answered/remaining progression comes from the session data, not client-side guessing
- a finished session renders the completion state (STUDY-013's view or a direct hand-off)
- loading, error, and empty states per §56 — never only the happy path

### Tests
- `pnpm --filter @danisolation-recall/web test` (reveal shows the back; answering records the review and advances; last answer reaches the completion state; API failure shows an error)
- `pnpm --filter @danisolation-recall/web typecheck` and `build` succeed

---

### STUDY-013

### Title
Add the session completion view

### Goal
Summarize a finished session and offer the way out.

### Dependencies
STUDY-012

### Status
TODO

### Files
apps/web/src/app/(protected)/study/[sessionId]/ (completion rendering + spec)

### Acceptance Criteria
- shows reviewed count and accuracy (§78's progress basics, scoped to the session)
- offers navigation back to the set (and the dashboard register)

### Tests
- `pnpm --filter @danisolation-recall/web test` (counts render; navigation)
- `pnpm --filter @danisolation-recall/web typecheck` and `build` succeed

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
TODO

### Files
apps/web/e2e/study.spec.ts

### Acceptance Criteria
- register → create a set → add cards → start a session → answer every card → reach the completion summary → the session is finished
- one journey test, not per-feature tests (SET-014/CARD-014 precedent)

### Tests
- `pnpm --filter @danisolation-recall/web test:e2e`

---

## Remaining MVP phases (coarse — not yet decomposed)

```text
Progress
  ↓
Search
```

Each phase will be decomposed into detailed atomic tasks when its implementation context is known. The Progress phase (§78: review count, accuracy, basic history, next review) reads the data this phase writes and should be decomposed once STUDY-001..010 land.

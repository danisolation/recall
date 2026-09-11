# Progress

Status report for `danisolation-recall`, updated 2026-09-11.

This file summarizes what has been achieved and where the project is going. `docs/TASKS.md` is the authoritative atomic task ledger; `docs/ROADMAP.md` is the full forward-looking roadmap.

---

## Achieved so far

### Foundation

- All `FOUNDATION-*` tasks complete: constitution, task ledger, roadmap, monorepo scaffold (pnpm + Turborepo), NestJS API, Next.js web app, Docker Compose PostgreSQL, Drizzle data layer, health check, environment documentation.

### Contracts phase

- `CONTRACTS-001..003` complete: validation and contracts decision recorded (ADR-004), `packages/contracts` workspace package created, request bodies validated via `nestjs-zod` DTOs with a global Zod validation pipe and a reshaping exception filter.

### Authentication — complete end to end

- Database: `users` and `sessions` tables with migrations (0000–0002); user repository with create/find by email/id.
- API: argon2id password hashing (AUTH-005), `POST /auth/register` (AUTH-008), `POST /auth/login` (AUTH-012), `GET /auth/me` behind the auth guard (AUTH-015/016), `POST /auth/logout` with server-side session revocation (AUTH-017), and per-IP login rate limiting — 5/minute, 429 `RATE_LIMITED` (AUTH-020A).
- Sessions per ADR-007: opaque 256-bit token in an httpOnly `SameSite=Lax` cookie; only the SHA-256 token hash is persisted (`sessions` table); validation is a hash lookup with expiry; logout deletes the row.
- Web: login screen built on the ADR-008 design foundation (Tailwind v4 tokens, Button/Input/FieldError primitives), React Hook Form validation against the shared `loginSchema`, and API connection through a Next.js rewrite proxy so the session cookie stays first-party (AUTH-018..020). A register screen mirrors it and signs the new user in on success (AUTH-022).
- Web session state: the home page reads the session server-side (forwarding the browser cookie to `GET /auth/me`) and renders the signed-in user with a logout control, or links to log in / create an account (AUTH-023).

### Documentation

- Handoff documentation written for machine-independent continuation: README, ARCHITECTURE, CONTRIBUTING, API reference, database docs, tech-debt ledger (DOCS-001).

### End-to-end testing

- Playwright E2E in place (AUTH-021): registration, login, and logout all run through the real UI against the real stack (browser → rewrite proxy → API → PostgreSQL) on isolated ports 3100/3101. AUTH-024 tracks the last missing screen (a protected page).

---

## Current state

- 6 pnpm workspace packages; all migrations applied through `0002_stiff_xavin.sql`.
- Test suites green: API 50 (unit + HTTP/DB integration), web 16 (component), contracts 12 (schema), E2E 3 (Playwright).
- The auth phase is complete (AUTH-001..023). Remaining web work: AUTH-024 (protected page); the hardening block in `docs/TASKS.md` tracks deferred real-world hardening (registration rate limiting, proxy-aware IP keying, structured logging, security headers, session cleanup).

## Plans for the future

### Now

- The last auth screen (AUTH-024): a protected page with a server-side session check.
- MVP continuation per `docs/ROADMAP.md`: study sets → cards → study sessions → progress → search.

### Next

- Phase 2: sharing, tags/folders, media, streaks, notifications.
- Redis (cache, rate-limit storage, queues) + background worker.

### Later

- Phase 3: AI-assisted learning, semantic search, recommendations, adaptive learning; observability.

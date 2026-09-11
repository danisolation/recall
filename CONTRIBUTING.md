# Contributing

This is a solo project, so this guide doubles as the machine-independent handoff: everything needed to set up, work, and continue the project the way it has always been worked on.

## The constitution

[`AGENT_RULES.md`](AGENT_RULES.md) governs all engineering work. The short version:

- work happens as **atomic tasks** tracked in [`docs/TASKS.md`](docs/TASKS.md) — one primary responsibility, reviewable diff, explicit acceptance criteria
- **one task per session/turn**, then stop; never implement the next task automatically
- never commit or push without an explicit request from the developer (§94)
- inspect the repository before writing anything; never code from memory
- challenge unnecessary complexity (§87, §99) — the simplest thing that satisfies the invariants wins

## Setup

Prerequisites: Node.js ≥ 22, pnpm 10.33.2 (`corepack enable`), Docker.

```bash
pnpm install
cp .env.example apps/api/.env
docker compose -f infra/docker/docker-compose.yml up -d
pnpm --filter @danisolation-recall/database db:migrate
```

The compose project is named `recall` (container `recall-postgres`, host port `${POSTGRES_PORT:-5432}`). If 5432 is already taken by another PostgreSQL, set `POSTGRES_PORT` in `infra/docker/.env` and match `DATABASE_URL` accordingly.

## Everyday commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Web (:3000) + API (:3001) with watch mode (Turborepo) |
| `pnpm build` / `pnpm typecheck` / `pnpm lint` | All packages |
| `DATABASE_URL=… pnpm test` | All tests — Turborepo builds workspace packages first |
| `DATABASE_URL=… pnpm --filter @danisolation-recall/api test` | API suite (unit + integration; needs running Postgres) |
| `pnpm --filter @danisolation-recall/web test` | Web component tests |
| `pnpm --filter @danisolation-recall/web test:e2e` | Playwright E2E (needs `playwright install chromium` once; starts its own servers on 3100/3101) |
| `pnpm --filter @danisolation-recall/contracts test` | Schema tests |
| `pnpm --filter @danisolation-recall/database db:generate` | Generate a migration from schema changes |
| `pnpm --filter @danisolation-recall/database db:migrate` | Apply migrations |

`API_ORIGIN` overrides the web app's proxy target (default `http://localhost:3001`) — useful when the API must run on another port.

## Workflow for a task

1. Read `AGENT_RULES.md`, check `git status`, inspect the relevant module.
2. Pick the next `READY` task from `docs/TASKS.md` (respect dependencies; a `TODO` task whose dependencies are all `DONE` is effectively ready).
3. Implement the smallest change that satisfies the acceptance criteria — nothing unrelated (§14).
4. Add/update tests at the right level; run the suite and typecheck.
5. Update `docs/TASKS.md`: status `DONE`, the real files touched, and the actual test evidence (counts, smoke results).
6. Recommend a conventional commit with the task ID, e.g. `feat(auth): rate limit login attempts (AUTH-020A)` — but **do not commit unless asked**.
7. Stop. Recommend the next task.

## Conventions

- Strict TypeScript; no `any` unless justified (§82).
- Error responses: `{ code, message }` with stable codes (§54) — see [`docs/api/auth.md`](docs/api/auth.md).
- Request/response schemas live in `packages/contracts`; both apps consume them (ADR-004).
- Test files: `*.spec.ts(x)` for unit/component, `*.integration.spec.ts` for DB/HTTP tests; colocated with the code.
- Frontend styling goes through the tokens and primitives (ADR-008); no one-off colors or ad-hoc styles.
- Time: pass `now` explicitly where domain logic needs it (§49).

## Gotchas (learned the hard way)

- **Stale `dist/`**: workspace packages are consumed via their compiled output. `pnpm test` at the root is safe (Turborepo builds dependencies first, `test.dependsOn: ["^build"]`), but a *filtered* run like `pnpm --filter @danisolation-recall/api test` after editing `packages/*/src` will test a stale build — rebuild that package first (`pnpm --filter @danisolation-recall/database build`).
- **`NODE_ENV`**: don't run tests with `NODE_ENV=production` exported in the shell (React's dev-only `act` disappears, builds behave differently). The web vitest config pins `NODE_ENV=test` for exactly this reason.
- **Integration tests need Postgres** and `DATABASE_URL`; they create and clean up their own rows (unique emails per spec).
- **The web app must not call the API cross-origin** — always go through the `/api` rewrite so the session cookie stays first-party.
- **Turbo strict env**: Turborepo 2 does not pass arbitrary environment variables to tasks. Anything a task script reads from `process.env` must be declared in `turbo.json` (`test.passThroughEnv` includes `DATABASE_URL`); otherwise root `pnpm test` fails even though filtered runs work.
- **Stale Docker containers**: if a previous compose incarnation left an orphaned Postgres (no published port), `docker ps` will show it; the canonical one is `recall-postgres` on 5432.
- **E2E ports**: Playwright uses 3100 (web) and 3101 (API) so it never collides with a normal `pnpm dev`; it starts and stops those servers itself (`reuseExistingServer` locally, always fresh in CI).
- **`role="alert"` in E2E**: Next.js injects its own route announcer with `role="alert"`, so E2E locators for form errors must be scoped (e.g. `.filter({ hasText: … })`).
- **E2E test data**: specs register users with unique emails and do not delete them (there is no user-deletion endpoint yet); rows accumulate in the dev database.

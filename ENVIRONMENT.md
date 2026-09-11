# Environment

Required environment variables and the local development setup for `danisolation-recall`.

## Required variables

### API

| Variable | Purpose | Example |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection string used by the Drizzle client | `postgresql://recall:recall@localhost:5432/recall` |
| `PORT` | Port the API listens on (defaults to `3001`) | `3001` |

The API loads `.env` from its working directory (`apps/api`). Create `apps/api/.env` from the root template:

```text
cp .env.example apps/api/.env
```

`drizzle-kit` falls back to the same local default, so database migrations work without a separate `.env`.

### Web

| Variable | Purpose | Example |
| --- | --- | --- |
| `API_ORIGIN` | Origin the Next.js rewrite proxies `/api/*` to (defaults to `http://localhost:3001`) | `http://localhost:3002` |

The web app never calls the API cross-origin: `/api/*` requests are proxied server-side to `API_ORIGIN`, so the session cookie stays first-party.

## Docker Compose variables

PostgreSQL reads its variables from `infra/docker/.env` (template in `infra/docker/.env.example`):

| Variable | Default |
| --- | --- |
| `POSTGRES_USER` | `recall` |
| `POSTGRES_PASSWORD` | `recall` |
| `POSTGRES_DB` | `recall` |
| `POSTGRES_PORT` | `5432` |

## Local development flow

```text
git clone <repo>
pnpm install
cp .env.example apps/api/.env
docker compose -f infra/docker/docker-compose.yml up -d
pnpm --filter @danisolation-recall/database db:migrate
pnpm dev
```

The web app runs on `http://localhost:3000` and the API on `http://localhost:3001` (health check at `/health`).

## Rules

- Never commit real secrets. `.env` files are gitignored; only `.env.example` files are tracked.
- Applications fail clearly at startup when required configuration is missing.

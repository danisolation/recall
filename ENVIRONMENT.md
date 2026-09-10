# Environment

Required environment variables and the local development setup for `danisolation-recall`.

## Required variables

### API

| Variable | Purpose | Example |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection string used by the Drizzle client | `postgresql://recall:recall@localhost:5432/recall` |

The API loads `.env` from its working directory (`apps/api`). Create `apps/api/.env` from the root template:

```text
cp .env.example apps/api/.env
```

`drizzle-kit` falls back to the same local default, so database migrations work without a separate `.env`.

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

## Rules

- Never commit real secrets. `.env` files are gitignored; only `.env.example` files are tracked.
- Applications fail clearly at startup when required configuration is missing.

# Roadmap

High-level product and engineering direction for `danisolation-recall`.

This describes *where the project is going*. `docs/TASKS.md` tracks *what exact atomic task* comes next.

---

## Now

### Foundation

- Project constitution (`AGENT_RULES.md`)
- Task ledger (`docs/TASKS.md`)
- Roadmap (this file)
- Monorepo scaffold (pnpm workspaces + Turborepo)
- Local development setup (Docker Compose for PostgreSQL; Redis later)
- `README.md`, `.gitignore`, environment documentation

### MVP (modular monolith: Next.js + NestJS + PostgreSQL)

- Authentication: register, login, logout, session
- Study sets: create, edit, delete, view, list
- Cards: create, edit, delete, reorder
- Study: start session, display card, reveal answer, answer card, finish session
- Progress: review count, accuracy, basic history, next review
- Search: basic set search via PostgreSQL
- Organization: folders or tags (choose one initially)

---

## Next

### Phase 2 — sharing and richer content

- Public sets, sharing, favorites
- Tags/folders (whichever was not chosen in MVP)
- Images, audio
- Streaks, advanced progress, notifications

### Architecture phase 2

- Redis for caching, rate limiting, and queue backend
- Background worker (BullMQ)

---

## Later

### Phase 3 — AI-assisted learning

- AI card generation, explanations, quiz generation, distractors, note summarization
- Semantic search
- Recommendations, adaptive learning
- AI as an optional subsystem behind an `AIProvider` abstraction

### Architecture phases 3–5

- Object storage + search abstraction
- Observability (logs, metrics, tracing)
- AI subsystem + async workflows

---

## Maybe

### Phase 4 — social and collaboration

- Classes, collaboration, real-time editing, social features

### Architecture phase 6

- Extract selected modules into services only when justified (independent scaling, deployment independence, or operational need)

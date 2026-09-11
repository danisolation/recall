# Technical debt

Intentionally deferred work, per §76. Each item states why the deferral is safe today and what the eventual fix looks like. Debt must be chosen, not accumulated silently.

| # | Problem | Impact | Why deferred | Potential solution | Priority |
| --- | --- | --- | --- | --- | --- |
| 1 | Rate limiting is per-instance in-memory (`@nestjs/throttler` default) | Counters reset on restart; a second API instance would break limits | Monolith MVP runs a single instance; Redis is a Phase 2 component (§87) | Swap in the throttler's Redis storage adapter | Medium |
| 2 | Login rate limiting keys on the socket IP; behind the Next rewrite proxy all traffic shares one IP | In dev, all users share one bucket; in production the limit would collapse per proxy | Solo-user MVP; only matters with real traffic or deployment | Enable Express `trust proxy` and honor `X-Forwarded-For` at deployment (§108) | Medium |
| 3 | Registration is not rate limited | Account-creation spam is possible | Auth arc completion came first; the mechanism (AUTH-020A) now exists | Apply `RateLimitGuard` + `@Throttle` to `POST /auth/register` with its own limits + tests | Medium |
| 4 | Sessions have a hard 7-day TTL; no sliding expiration; expired rows are never deleted | Sessions die mid-use after a week; `sessions` rows accumulate | Worker phase does not exist yet (§47 retention policy) | Refresh `expires_at` on activity; expired-session cleanup job in the worker | Medium |
| 5 | No structured logging or request ids (§63) | Harder to correlate failures across web/API | Observability is a later phase; console logging suffices for MVP | Nest logger (pino) + request-id middleware; structured fields (§63) | Medium |
| 6 | No security headers (CSP, HSTS, etc., §42) | Misses production hardening baseline | Nothing is deployed yet | `helmet` at bootstrap when deployment nears | Medium |
| 7 | Workspace packages are consumed via compiled `dist/` | Filtered test runs can execute stale builds (see CONTRIBUTING gotcha) | Turborepo covers root-level runs; DX impact is small | TS project references or watch-mode builds for packages | Low |
| 8 | `PROGRESS.md` / `README.md` can drift from reality | Newcomers get a wrong picture | Mitigated: the task loop updates `TASKS.md` every time | The handoff docs (DOCS-001) establish the refresh point; revisit per phase | Low |

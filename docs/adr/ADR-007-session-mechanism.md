# ADR-007: Session mechanism

## Context

Registration and login exist (AUTH-008, AUTH-012), but `POST /auth/login` returns only the user — no session credential yet; its acceptance criteria deferred session issuance to AUTH-014. The remaining auth tasks depend on a session mechanism: AUTH-014 issues and persists it, AUTH-015 validates it on subsequent requests, AUTH-017 invalidates it on logout. The only client is the browser-based Next.js app; there are no native or non-cookie API clients. PostgreSQL via Drizzle is the source of truth (§30); Redis and the background worker are Phase 2 (ROADMAP). Password hashing is already argon2id (AUTH-005). Per §87, every component added now must solve a problem that exists today.

## Decision

- The session credential is an opaque, random 256-bit token generated with `node:crypto` (`randomBytes`), delivered to the browser in an `httpOnly`, `SameSite=Lax` cookie (`Secure` in production).
- Only a SHA-256 hash of the token is persisted, in a new `sessions` table in PostgreSQL (unique index on the hash, `user_id` foreign key, `expires_at`, `created_at`); the raw token never touches the database.
- Session validation (AUTH-015) hashes the cookie value and looks up the live session row together with its user.
- Logout (AUTH-017) deletes the session row server-side and clears the cookie.
- Issuance and validation live inside the auth module; no other module touches session state directly (§29).

## Alternatives

- JWT in an httpOnly cookie (the ledger's earlier recommended default) — signature-verified and stateless, with no database read per request; rejected for MVP because logout (AUTH-017) requires server-side invalidation, which forces a denylist (server state anyway) or leaves tokens valid until expiry, and secret management plus expiry/refresh design solve no problem that exists today (§87). Revisit when a non-cookie client or service extraction appears (§88).
- Session token in an `Authorization` header or localStorage — avoids cookie semantics but exposes the credential to XSS and loses automatic transport; an `httpOnly` cookie is the safer default for a browser-only MVP.
- Redis-backed sessions — a later optimization (§37); PostgreSQL is sufficient and keeps the source of truth singular.

## Why

- Logout that actually revokes is a security requirement (§40, §42), not a nice-to-have; with an opaque token, revocation is a DELETE.
- Storing only the token hash means a database leak does not yield usable credentials (§125).
- `httpOnly` blocks script reads (XSS), `SameSite=Lax` keeps the cookie off cross-site requests (the CSRF baseline), and `Secure` in production protects transport (§91).
- No new dependency, one migration, and PostgreSQL remains the single source of truth.

## Tradeoffs

- Every authenticated request costs one indexed database lookup; irrelevant at MVP scale and cacheable in Redis later if measurement ever justifies it (§62).
- Expired rows are never validated but still occupy space; a cleanup path belongs to the worker phase or a retention policy (§47).
- The domain is not JWT-shaped; if API tokens or mobile clients arrive, token issuance is added alongside sessions inside the auth module rather than replacing it.

## Consequences

- AUTH-014 adds the `sessions` table (schema plus migration per §33), issuance, and the cookie; the login response body stays user-only — the credential moves by `Set-Cookie`.
- AUTH-015's guard resolves the cookie to the request user; AUTH-016 covers rejection without a cookie and with an invalid one.
- AUTH-017 deletes the row and clears the cookie.
- Cookie flags and expiry become part of the API contract; the CSRF posture (SameSite=Lax today, a token if cross-site form posts ever matter) is revisited with the frontend integration (AUTH-020).

# Auth API reference

All bodies are JSON. The canonical base URL is the API itself (`http://localhost:3001`); the web app calls the same endpoints through its rewrite proxy (`http://localhost:3000/api/...`), which is what keeps the session cookie first-party.

Every error response keeps the house shape:

```json
{ "code": "<STABLE_CODE>", "message": "<human-readable>" }
```

Validation failures are the exception (they carry field detail instead of a message):

```json
{
  "code": "VALIDATION_ERROR",
  "errors": { "formErrors": [], "fieldErrors": { "email": ["Enter a valid email address"] } }
}
```

---

## POST /auth/register

Creates a user. The email is normalized (trimmed, lowercased) and the password is stored as an argon2id hash — never plaintext.

**Request** — `registerSchema`:

| Field | Rules |
| --- | --- |
| `email` | string, valid email, ≤ 255 chars |
| `password` | string, 8–128 chars |

**Responses**

| Status | Body | When |
| --- | --- | --- |
| 201 | `{ id, email, createdAt, updatedAt }` | User created (no `passwordHash` is ever returned) |
| 400 | `VALIDATION_ERROR` | Invalid email or password |
| 409 | `{ code: "EMAIL_ALREADY_REGISTERED", message }` | Email already exists |

---

## POST /auth/login

Verifies credentials and starts a session: an opaque 256-bit token is returned in an httpOnly cookie; only its SHA-256 hash is stored (ADR-007). **Rate limited to 5 attempts per 60s per IP** — see 429 below.

**Request** — `loginSchema`:

| Field | Rules |
| --- | --- |
| `email` | string, valid email, ≤ 255 chars |
| `password` | string, 1–128 chars (login does not enforce the registration minimum) |

**Responses**

| Status | Body / headers | When |
| --- | --- | --- |
| 200 | `{ id, email, createdAt, updatedAt }` + `Set-Cookie: session_token=<token>; HttpOnly; SameSite=Lax; Expires=…` | Credentials valid |
| 400 | `VALIDATION_ERROR` | Invalid input |
| 401 | `{ code: "INVALID_CREDENTIALS", message: "Invalid email or password" }` | Unknown email or wrong password (identical response for both) |
| 429 | `{ code: "RATE_LIMITED", message: "Too many attempts. Try again shortly." }` | More than 5 attempts in the last minute from one IP |

---

## GET /auth/me

Returns the authenticated user. Requires the session cookie.

| Status | Body | When |
| --- | --- | --- |
| 200 | `{ id, email, createdAt, updatedAt }` | Session valid (cookie → hash lookup → live, unexpired session) |
| 401 | `{ code: "UNAUTHENTICATED", message: "Authentication required" }` | No cookie, unknown token, revoked session, or expired session |

---

## POST /auth/logout

Revokes the current session server-side (deletes the row) and clears the cookie. Requires the session cookie.

| Status | Body / headers | When |
| --- | --- | --- |
| 204 | empty + `Set-Cookie: session_token=; Expires=Thu, 01 Jan 1970 …` | Session revoked |
| 401 | `{ code: "UNAUTHENTICATED", … }` | No/invalid session cookie |

---

## GET /health

Liveness check; runs `SELECT 1` against PostgreSQL.

| Status | Body |
| --- | --- |
| 200 | `{ "status": "ok" }` |

---

## Error codes

| Code | HTTP | Meaning |
| --- | --- | --- |
| `VALIDATION_ERROR` | 400 | Request body failed the shared Zod schema |
| `EMAIL_ALREADY_REGISTERED` | 409 | Registration with an existing email |
| `INVALID_CREDENTIALS` | 401 | Login rejected (deliberately vague between unknown email and wrong password) |
| `UNAUTHENTICATED` | 401 | Missing, unknown, or expired session |
| `RATE_LIMITED` | 429 | Too many login attempts from one IP |

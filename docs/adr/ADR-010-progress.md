# ADR-010: Progress surfaces and the due queue

## Context

The study phase is complete end to end (STUDY-001..014): sessions, append-only reviews, and per-card progress are all written by the endpoints, and the E2E journey proves the loop. §78's last unstarted MVP slice is progress — review count, accuracy, basic history, next review. Everything it displays already exists: `reviews` (correct, reviewed_at) is history and accuracy source; `user_card_progress` (review_count, correct_count, next_review_at, unique per user+card) is scheduling state; `study_sessions` (status, started_at, finished_at) is the history's entries; the sessions repository already has `listByUser`. The phase is therefore read-only — no migrations, no new invariants — and the only decisions left are presentation-shaped: which surfaces show what, what "due" means, which endpoints exist, and how accuracy is represented. The web app has two established data patterns (server-fetch lib modules; the study screen's client fetch) and one accuracy precedent (CompletionView derives a rounded integer percent from counts).

## Decision

- **One dedicated surface**: a protected `/progress` page carries all four of §78's basics — a summary strip (review count, accuracy), the due queue ("next review"), and the session history list. The dashboard changes only by gaining one "View progress" text link in its existing register. No per-set or per-card progress views in MVP.
- **Due rule**: a card is due when `next_review_at <= now` (now or overdue) on the caller's own `user_card_progress` row. Rows with a null `next_review_at` — never reviewed — are **not** due: "next review" is a scheduling fact, and never-studied cards are discovered through their set's "Study" control, not a queue. The queue is ordered by `next_review_at` ascending (most overdue first) and offset-paginated with the house limits (default 20, cap 100).
- **Endpoints** (§52 register, all owner-scoped §41):
  - `GET /progress` — `{ totalReviews, correctReviews, dueCount }` in one response.
  - `GET /progress/due` — paginated `{ items, nextOffset }`; items carry `cardId`, `front`, `setId`, `setTitle`, `nextReviewAt` — identity and destination, not the back.
  - `GET /study-sessions` — paginated history, newest first, items the session row plus `setTitle` (joined in the query, not stored — the history UI needs a name, one join, no N+1).
- **Accuracy representation**: the API returns **counts only**; accuracy is derived client-side as a rounded integer percent — the same computation CompletionView already performs. Zero-review users simply have `totalReviews: 0`; the client renders "no answers yet" rather than a fabricated 0%.
- **Set detail shows no scheduling data**: the due queue is the only place `next_review_at` appears in MVP. The cards list contract (CARD-005) stays untouched.
- **No schema changes** — stated explicitly: the phase reads only what STUDY-002..004 store.

## Alternatives

- **Dashboard-embedded progress section** — one fetch on the landing page, but the dashboard becomes mixed-concern (account, sets, and stats), and every new aggregate would grow it; a dedicated page with one link is cheaper now and growable later.
- **Per-set progress on the set detail page** — genuinely useful ("how am I doing on this set?"), but it means either joining progress into the cards list response (contract churn on CARD-005) or another endpoint plus UI; nothing in §78 asks for it. Deferred to Phase 2's "advanced progress".
- **Server-computed accuracy percent** — precomputing `accuracy: 67` duplicates a representation the client already derives (§82); counts are the facts, formatting is presentation. If a non-web client ever appears, it formats its own way.
- **Due includes never-reviewed cards** — would make the queue a full deck listing that grows unboundedly and duplicates the set page's job; "due" would stop meaning "the ladder scheduled this".
- **Cursor pagination** — the same tradeoff SET-005 recorded: offset is acceptable at MVP scale, consistent across every list; revisit when a list outgrows it (§36).
- **FSRS-style recommended ordering** — the ladder's `next_review_at` ascending *is* the honest MVP ordering; FSRS remains the recorded body swap behind `schedule()` (ADR-009) and would change the column's values, not this query's shape.

## Why

- One page for four facts keeps the MVP to one new route, one entry link, and one E2E journey — the smallest vertical slice that completes §78.
- The due rule leans entirely on the scheduling state the study phase writes; no new model, and "due" stays a meaningful, bounded queue (a card enters it only after its first review, and only the ladder's timing puts it there).
- Counts-only contracts keep the API honest (facts, not formatting) and let the web reuse its existing accuracy derivation.
- Promoting `listByUser` to an endpoint costs no new queries beyond the `setTitle` join, and the whole phase proving itself with zero migrations validates ADR-009's schema design (§45/§46 separations).

## Tradeoffs

- Offset pagination on all three lists — same ceiling as every other list in the system (§36), revisited together if any list outgrows it.
- No per-set/per-card progress views in MVP — a user studying many sets cannot compare them; accepted until Phase 2 asks.
- `setTitle` on history items is a per-request join — a small read-model denormalization for UI convenience, computed not stored, so it cannot drift.
- `dueCount` in the summary and the due list are separate queries executed within one render — the number can drift between them under concurrent study; both are `now`-scoped reads and the discrepancy is self-correcting on reload.

## Consequences

- PROGRESS-002 adds the progress repository (totals, due queue) with owner-scoped SQL; PROGRESS-003/004/005 expose `GET /progress`, `GET /progress/due`, and `GET /study-sessions`; PROGRESS-006 builds `/progress` with the dashboard link; PROGRESS-007 extends E2E coverage.
- `listByUser` gains the `setTitle` join in PROGRESS-005 — the one touch to an existing repository method.
- The cards list, set detail, and study screen contracts are unchanged; the study screen remains the only writer-facing surface of the phase.
- Phase 2's "advanced progress" (per-set stats, streaks, notifications) extends `/progress` and this schema without re-shaping any endpoint decided here.

# ADR-009: Study sessions, reviews, and progress

## Context

Study sets and cards are complete end to end (SET-001..014, CARD-001..014). The next MVP slice per §78 is the study loop: start a session for a set, display a card's front, reveal the back, answer the card, finish the session. The tasks that implement it (STUDY-002..014) need decisions made once instead of per-task: the session's states and transitions (§47), the study mode, the answer model, how `UserCardProgress.next_review_at` is produced (§45, §48), whether a session snapshots its cards, and what deleting a set does to the history that references it (§46). The only client is the browser app; PostgreSQL is the source of truth (§30); no scheduling infrastructure exists and none is justified today (§87). Progress surface (counts, accuracy, next review) is the following phase and must not require schema churn.

## Decision

- **Session states**: MVP uses a subset of §47 — `ACTIVE`, `COMPLETED`, `ABANDONED`. Creating a session makes it `ACTIVE` (no separate `CREATED` state: a session exists to be studied, and an empty intermediate state adds nothing). `PAUSED` is deferred until a pause feature exists. Transitions: `ACTIVE → COMPLETED` (finish) and `ACTIVE → ABANDONED` (explicitly walk away); both set `finished_at`. Terminal states accept nothing — reviews on a non-`ACTIVE` session are rejected with 409 `INVALID_STUDY_SESSION`.
- **Study mode**: one MVP mode — an ordered pass through the set's cards in `position` order, with **live card order** (no per-session snapshot). The start-session response includes the session and the set's current ordered cards (front and back — owner-only data the client could fetch anyway, so including it costs nothing and makes the study screen self-contained); `GET /study-sessions/:id` returns the session, its reviews, and the same card list so a resume is one fetch. Randomization arrives later as an injected random source (§50) without contract changes.
- **Answer model**: binary — `correct: boolean` on each review. The MVP UI offers exactly two answer controls (§78's "answer card"); a graded scale would be UI pretending to be data. Reviews are inserted once and never updated (§46).
- **Scheduling**: a minimal Leitner-style ladder, isolated as a pure function `schedule(progress, correct, now) → { streak, nextReviewAt }` living in the study module (§48's conceptual shape: deterministic, no system-time reads, independently testable). A streak of consecutive correct answers moves the card through fixed intervals — 10 minutes → 1 day → 3 days → 7 days (capped); an incorrect answer resets the streak and schedules 10 minutes. `user_card_progress` carries `streak` (consecutive correct answers) as its scheduling state. FSRS is the upgrade path: it swaps the function's body (and adds columns for its state) behind the same signature, which is why the function is isolated from controllers and persistence from day one (§48).
- **Duplicate reviews**: one review per card per session. A second answer for the same card returns 409 `REVIEW_ALREADY_RECORDED` (§54's code exists for exactly this). Retries after network failure are not silently absorbed — the client shows the error; "study the set again" means starting a new session (§55: design the retry behavior, never assume retry is safe).
- **Finishing**: idempotent — finishing a `COMPLETED` session again is a no-op success (safe retries); finishing an `ABANDONED` session is rejected with 409 `INVALID_STUDY_SESSION`.
- **Error codes** (§54 register): 404 `SESSION_NOT_FOUND` for a missing or foreign session (indistinguishable, §41); 400 `VALIDATION_ERROR` for bad input; 409 `INVALID_STUDY_SESSION` for state-machine violations; 409 `REVIEW_ALREADY_RECORDED` for duplicates.
- **Deletion**: everything cascades — deleting a set deletes its cards, sessions, reviews, and progress rows (FK `ON DELETE CASCADE` down the chain). History loss is deliberate: sets are private content, deletion is already a confirmed irreversible action in the UI (SET-013), and retaining orphan history would need a contentless-review model no current requirement justifies (§87, §107).

## Alternatives

- **FSRS now** (§48's preferred scheduler) — the established algorithm, but it needs a dependency, weight parameters, and graded ratings to be meaningful; its state machinery solves no problem that exists today, when the product only needs a plausible `next_review_at` (§87). Recorded as the upgrade path behind the isolated `schedule()` signature.
- **Snapshot the session's cards at start** — immune to mid-session edits, but adds a join table and copy semantics for a single-user MVP where the only writer is the owner; live order plus the card-belongs-to-set review check (STUDY-009) keeps behavior honest if cards change mid-session (added cards appear on the next run; deleted cards fail the review with 404 and are skipped).
- **Graded ratings from day one** — future-proofs reviews for FSRS but forces the MVP UI to invent three or four meaningful buttons before the product knows what learners need; a later `ADD COLUMN rating` migration on an append-only table is cheap and the boolean stays meaningful (§33).
- **Retain history after set deletion** — preserves learning history (§46) but requires nullable/deleted-card references and a contentless rendering story throughout the Progress phase; rejected until sharing or copying creates a real need.
- **Store `next_review_at` only, no streak** — a doubled-interval rule can recompute from history, but that means scanning reviews on every answer; one integer column is cheaper and legible.

## Why

- The state machine is the smallest that satisfies §78 and still makes STUDY-009/010 mechanical: every endpoint's allowed-state question is answered by one table.
- A pure, isolated scheduler with fixed intervals is honest for MVP (§48: prefer established algorithms over invented ones — a Leitner ladder is the canonical minimal system), testable without a database, and replaceable by FSRS without touching endpoints.
- Including the cards in the session payloads keeps the study screen to one fetch on start and one on resume — fewer round trips than a per-card "next card" endpoint, with no authorization change (all of it is owner-scoped, §41).
- Binary answers match the two-control UI; counts and accuracy (§78 progress) derive directly from `correct`.
- Cascading deletes keep the referential story identical to the rest of the schema (§32) — no soft-delete machinery for a phase that has not asked for it.

## Tradeoffs

- Live card order means a session's walk can shift under the user's feet while they edit the set mid-session; acceptable for a single-user MVP and bounded by the review-time ownership check.
- The fixed ladder is not adaptive — a card answered correctly after a month gets the same +3 days as one answered after a minute; the Progress phase will show whether the ladder's coarseness matters before FSRS earns its complexity (§62: measure before optimizing).
- The binary answer discards confidence information that a graded model would keep; the migration to add it is simple precisely because reviews are append-only.
- Cascade-on-delete destroys learning history along with content; if sets ever become shareable or exportable (§113), deletion semantics must be revisited before that ships.
- `ABANDONED` is only reachable through an explicit endpoint call in MVP; there is no sweeper for sessions abandoned by closing the browser — a cleanup job belongs to the worker phase (§47), and unfinished `ACTIVE` sessions are resumable by design (GET endpoint).

## Consequences

- STUDY-002 adds `study_sessions` (`user_id`, `set_id`, `status`, `started_at`, `finished_at`) with the cascade FKs above; STUDY-003 adds `reviews` (`session_id`, `card_id`, `correct`, `reviewed_at`, insert-only, indexed for the Progress phase); STUDY-004 adds `user_card_progress` with the `(user_id, card_id)` unique constraint plus `streak` and `next_review_at`.
- STUDY-006 owns the repository, including the transactional review insert + progress upsert (§34) and the `schedule()` function's only production caller.
- STUDY-007/008 shape their payloads as decided here (session + cards; session + reviews + cards); STUDY-009 enforces the single-review rule with `REVIEW_ALREADY_RECORDED`; STUDY-010 implements the idempotent finish.
- The Progress phase reads only what this schema already stores — counts, accuracy, per-card next review — with no migration.
- The UI's "answer card" is two controls (STUDY-012); any future graded scale changes the UI and the scheduler together behind ADR-009's recorded upgrade path.

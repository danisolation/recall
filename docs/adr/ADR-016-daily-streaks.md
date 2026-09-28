# ADR-016: Daily streaks — derived from review history

## Context

Phase 2 continues per `docs/ROADMAP.md`: "Streaks, advanced progress, notifications". The product's learning loop records every answer as an immutable review event (ADR-009, §46), and the `/progress` page already shows review counts, accuracy, session history, and the due queue (ADR-010) — but nothing rewards *returning*. The dominant retention mechanic in learning products is the daily streak: "you have practiced N days in a row." Constraints inherited: §46 separates historical events (`reviews`) from current state (`user_card_progress`) and the schema already has a column named `streak` — the ladder's per-card consecutive-correct count (ADR-009) — so the domain language must not collide; §49's time-handling rules ("today" is where streak bugs live); ADR-010's counts-only API stance; §11's smallest-slice discipline.

## Decision

- **The feature is the *daily* streak.** Named explicitly to stay distinct from `user_card_progress.streak`, which is the per-card ladder state: a daily streak counts *days on which the user practiced*, the ladder streak counts *consecutive correct answers for one card*. One is a retention signal over history; the other is scheduling state. No schema reuse, no overloaded terms.
- **A day of practice = at least one review.** `reviews.reviewed_at` is the atomic learning event (§46) — a session that was abandoned after real answers still counts as practicing; a day with sessions but zero answers does not. Reviews reach their user through the session join, the same one `getSummary` already makes.
- **The streak is derived, never persisted.** A read query fetches the user's distinct UTC review dates (a year of daily study is 365 rows — trivial at personal scale), and a pure function walks them against `today`. Reviews are immutable, so a derived streak can never drift from its source; there is no write on the hot review path, no backfill, no race between concurrent reviews, no second thing to migrate. This is the same isolation the study module's scheduler got in ADR-009/§48: `computeDailyStreaks(reviewDays, today)` is a pure, deterministic, independently tested function in the progress module.
- **Day boundaries are UTC** (§49). Consistent with the app's fixed-locale/UTC rendering everywhere else. The tradeoff is real — a learner whose local midnight differs from UTC's sees their "day" shift — and is recorded rather than solved: per-user timezones need user settings and locale data, a slice of their own.
- **Two facts, the Duolingo grace rule, nothing more.** `currentStreak` counts consecutive practice days ending today *or yesterday* (having studied yesterday but not yet today is still a living streak — showing 0 at 9am would be lying about the user's habit), and `longestStreak` is the best run ever. No badges, no milestones, no freeze tokens — retention mechanics beyond the number are deferred.
- **The summary endpoint grows two fields.** `GET /progress` returns `currentStreak` and `longestStreak` alongside the existing counts — facts only, consistent with ADR-010's "accuracy is derived client-side" stance. No new endpoint; the progress page's stat panels gain the display.

## Alternatives

- **Persist `current_streak` / `longest_streak` on a per-user row** — the classic production shape once write volume or cross-request reads justify it, but it must handle day-boundary recomputation on every review, timezone changes, and concurrent-answer races; at this scale it is state that can only drift. The pure-function derivation keeps the option open (same inputs, cached later if it ever matters) without paying for it now.
- **Compute in SQL** (window functions over date gaps) — possible, but it buries the grace rule and the today-or-yesterday edge inside a query nobody can unit test; the boundary belongs in a tested pure function, the database only supplies the dates.
- **Count completed sessions instead of reviews** — abandons §46's event model: a session is an interaction wrapper, the review is the learning act. Sessions can also be abandoned mid-practice, which *was* practice.
- **Badges/milestones in the same slice** — doubling the surface for decoration the data does not need; the derived facts support them later for free.

## Why

- The reviews table already holds everything the streak needs — the feature is a query plus a pure function plus two fields on an existing endpoint. That is the smallest honest slice in the roadmap bullet.
- Derivation over persistence keeps §46's discipline intact: history stays the single source of truth, and no new current-state table can disagree with it.
- The pure function with an injected `today` (§49) makes the hard parts — the grace rule, month boundaries, long gaps — unit-testable without a database or a clock.

## Tradeoffs

- UTC day boundaries mean the streak can roll over at a user's local afternoon or morning; recorded, and the first thing a per-timezone slice would fix.
- Every `GET /progress` recomputes the streak from full history; at personal scale this is one indexed query over a few hundred rows. If it ever shows up, the same function can sit behind a cache — noted, not built (§87).
- The grace rule means `currentStreak` can be nonzero on a morning with no activity yet — intentional; the number describes the habit, not the instant.
- No notification, widget, or milestone surfaces the streak outside `/progress` in this slice.

## Consequences

- STREAK-002 adds the pure `computeDailyStreaks` (unit-tested: grace rule, gaps, month boundaries, longest vs current); STREAK-003 the repository's distinct-review-days read; STREAK-004 the summary fields and HTTP integration coverage; STREAK-005 the progress page display; STREAK-006 the docs sweep.
- No new E2E journey: a multi-day streak cannot be exercised in a browser without time travel, and the page render is already covered by the progress journey — the day-boundary logic lives where it is testable, with `now` injected (recorded so the gap is deliberate, not forgotten).
- `docs/database/schema.md` is unchanged — no migration exists; ARCHITECTURE's data model notes the derivation in the sweep.
- Recorded deferrals: per-user timezones, persisted streaks behind a cache, badges and milestones, streak surfaces outside the progress page.

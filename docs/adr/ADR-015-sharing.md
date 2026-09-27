# ADR-015: Public sets — sharing by URL

## Context

Phase 2 continues. `docs/ROADMAP.md`'s first Phase-2 bullet is "Public sets, sharing, favorites" — and the product has no way to share: every endpoint is owner-scoped (§41), every content page sits behind the `(protected)` layout's auth gate, and a set is invisible to anyone but its owner. The dominant sharing story for flashcards is small and concrete: "here, study from my set" — send someone the link. There is no user discovery behind it, no social graph, no inline collaboration, and none is claimed. Constraints inherited: §41's ownership scoping is the API's backbone and must not be weakened by the exception; content-safety (a public set's cards remain the owner's to edit or delete); §23 URL state; §53 strict validation; and the study/progress model assumes the learner owns the set — a assumption a public viewer breaks.

## Decision

- **Visibility is a set property.** `study_sets.visibility` — text, not null, default `private`, holding `private` | `public` tokens owned by the repository, exactly like `study_sessions.status` (ADR-009): plain text, transitions owned by the only writer. The default guarantees every existing set stays private. Migration `0010_*`.
- **Sharing is the URL.** `GET /public/sets/:id` — mounted **without the auth guard** — returns the set's title, description, cards (in study order), and tags, but **only when `visibility` is `public`**. A private set, a foreign private set, and a missing set all fold into the same 404 `SET_NOT_FOUND`: §41's foreign-equals-missing principle extended one axis — to visibility. There is deliberately **no listing endpoint** for other users' public sets; nothing is discoverable that was not handed to you.
- **The owner toggles through the existing edit path.** `PATCH /sets/:id` gains a validated `visibility` field (`private` | `public` enum), riding the same owner-scoped update as title and description — one write surface, no new endpoint. The edit form gains a Sharing select (Private/Public), mirroring the folder select's placement pattern, and the set detail page shows the current state in its info panel so the owner can confirm what the world sees.
- **The public view is a separate route outside `(protected)`.** `/share/sets/[id]` renders title, description, tags, and the cards' fronts and backs — read-only, with no study, edit, delete, or owner-identity elements. It fetches the public endpoint server-side without credentials and `notFound()`s on 404. Signed-out and signed-in visitors see the same page.
- **Studying a shared set is not in this slice.** A visitor's reviews would need progress ownership decisions (whose `user_card_progress`?), copies, or attribution — Phase-3-scale questions that would double this slice. The public page is a reading view.

## Alternatives

- **Unlisted share tokens** (`/share/sets/:id?token=…`) — marginally more private, but it adds a second secret to generate, store, rotate, and leak; the ROADMAP explicitly says "public sets", and unsharing (back to `private`) achieves revocation with zero machinery.
- **Save-a-copy** ("duplicate this set into my account") — genuinely useful, but it is a write path over another user's content plus a cards-clone transaction; a feature of its own, deferred.
- **Favorites/bookmarks** — needs per-user bookmark storage and a surfaced list; deferred with the rest of the ROADMAP bullet.
- **Public discovery (browse public sets)** — rejected outright: it changes the product into a platform with moderation obligations the project has not earned.

## Why

- Sharing is the product's organic growth loop — the first Phase-2 item for a reason — and public-by-URL is the smallest slice that delivers it: one column, one narrow exception endpoint, one page, one toggle.
- The exception is shaped to keep the private surface intact: no guard is simply *absent* on one read-only GET, and that GET refuses everything that is not explicitly public. No existing query, contract, or page changes its authorization behavior.
- Counts and cards ride the existing repository reads; the tags describe the content and are safe to show with it.

## Tradeoffs

- A public set is readable by anyone holding the URL until the owner unshares — no expiring or passworded links; revocation is the toggle.
- The public endpoint is unauthenticated and currently rate-limited only by the general throttler defaults; a read-only GET bounds the abuse surface, and real limits arrive with the Redis phase (recorded).
- The public page is content-only — no "study this set" for visitors; the most requested follow-up, deferred deliberately.
- Public pages are served `no-store` like everything else, leaving CDN caching on the table for now — noted as a later optimization, not a need.

## Consequences

- SHARE-002 adds the column and migration `0010_*` (schema docs updated); SHARE-003 the public controller (sets module, guard-less) and the `visibility` contract + update path; SHARE-004 the owner's toggle and detail-page state; SHARE-005 the public page and its credential-less fetcher; SHARE-006 the E2E journey (a fresh logged-out browser context proves the page works without a session); SHARE-007 the docs sweep (decision-table row).
- ARCHITECTURE's data model gains the `visibility` column; the route map gains an unauthenticated route — the first outside the auth perimeter.
- Recorded deferrals: favorites, save-a-copy, studying shared sets, discovery, public-endpoint rate limiting.

# ADR-011: Basic set search

## Context

The progress phase is complete, leaving §78's last MVP slice: basic set search. The library lives in `study_sets` (title, description) behind `GET /sets`, an owner-scoped offset-paginated list the dashboard renders. §51 pins the engine for MVP — PostgreSQL — and asks that the module be shaped so a later engine (Meilisearch, Typesense, OpenSearch) is a swap rather than a rewrite, without adding that engine merely because large systems have one. The user's library at MVP scale is hundreds of sets, not millions (§62: measure before optimizing; §87: every component earns its complexity today). §85 denies abstractions that only have one implementation.

## Decision

- **Fields**: the caller's own sets, matched on `title` and `description`. Card content is deferred — searching cards means per-set text aggregation and a ranking question no current requirement asks (§78 wants "basic set search"); tags/folders do not exist yet (§78's choose-one is still open). The deferral and its upgrade path (join `cards` into the searchable text, or add a content column to whatever index arrives) are recorded here.
- **Matching rule**: case-insensitive substring — `ILIKE '%q%'` against `title OR description` on a **trimmed** query, with `%`, `_`, and `\` **escaped** in the input so a user cannot inject wildcard semantics into their own search (§42). No index, no tsvector column, no migration: at personal scale a sequential scan per search is free, and the upgrade path is recorded (pg_trgm GIN index for substring speed, tsvector full-text for relevance ranking, or §51's external-engine ladder — whichever a measured need asks for first).
- **API shape**: an optional `q` parameter on the existing `GET /sets` — collection filtering per §52, not a new `/search` resource. The query schema stays file-local in the sets controller (the list-sets precedent). Bounds: after trimming, `q` is capped at 200 characters with 400 `VALIDATION_ERROR` beyond (§53: explicit contracts, no silent clamping); an empty or whitespace-only `q` means **no filter**, not an error — submitting an empty search box is a normal user action, not malformed input. `q` composes with the existing `limit`/`offset` pagination and the unchanged `nextOffset` rule.
- **Surface**: a search input on the dashboard implemented as a plain HTML form (`method="get"`, `action="/dashboard"`) — zero client JavaScript, and the query lives in URL state (§23), so a search is shareable, bookmarkable, and re-renderable server-side. Results render through the existing SetList; three §56 states stay distinct: no library ("Create your first study set"), a query with no matches ("No sets match …" with the query kept in the input as the retry affordance), and matches.
- **No dedicated search module or page today**: one collection filtered by its own repository's WHERE clause is not a domain (§28's `search/` module earns existence when search spans content types or a second engine lands — §85, §87). §51's engine-swappability is honored by *location*: the matching SQL lives in the sets repository, so an engine swap is a repository change plus a task, not a cross-cutting rewrite.
- **No schema changes** — stated explicitly: search reads only what SET-001 already stored.

## Alternatives

- **PostgreSQL full-text search now** (`tsvector` generated column + GIN index + `tsquery`) — real relevance ranking and word matching, but it costs a migration, ranking configuration, and stemmer decisions, and solves no problem a hundred-set library has (§62, §87). The recorded upgrade path when "find my set" stops meaning "substring in my set".
- **pg_trigram trigram index** — makes `ILIKE '%q%'` index-backed for large tables; needs the extension and an index for a scan that is currently free. Same trigger to adopt: measured scale.
- **A dedicated `GET /search` endpoint + `search/` module** — mints a second way to list sets, duplicates the envelope and pagination, and splits "my sets" across two resources (§52). Revisited when search spans sets *and* cards or a second engine exists.
- **An external engine (Meilisearch/Typesense) from day one** — §51's ladder step two; infrastructure without a problem today (§87), plus a sync story for every set mutation.
- **Client-side filtering** — the library is paginated (20 per page), so client-side filtering would only search the visible page and would duplicate the server's ownership rule in the browser; wrong on both counts.

## Why

- Substring matching is the honest meaning of "search my sets" at this scale: predictable, index-free, and testable without new infrastructure.
- Filtering the existing collection keeps one list endpoint, one envelope, one client pattern — the whole feature is a WHERE clause, a query param, and a form.
- A form GET puts the query in the URL, which is where §23 says this state belongs, and costs zero JavaScript.
- The escaping, bounds, and empty-means-absent rules keep the contract explicit at exactly the points where search inputs usually leak (§42, §53).

## Tradeoffs

- `ILIKE '%q%'` cannot use a plain index (leading wildcard) — irrelevant at current scale, revisited with pg_trgm the first time a search feels slow (§62).
- No relevance ranking: matches stay in recency order rather than best-match order; acceptable until libraries are large enough for ordering to matter.
- Card content is unsearchable — "which card was about X?" stays unanswered until a later phase extends the searchable text.
- Substring matching produces false positives ("bio" matches "macrobiotics"); the FTS upgrade is the answer if that annoys real usage.

## Consequences

- SEARCH-002 extends `listByOwner` with the owner-scoped filter and adds `q` to the controller's query schema with its bounds; SEARCH-003 adds the form input, the dashboard's `?q=` reading, and `listSets` forwarding; SEARCH-004 covers the journey.
- The `GET /sets` contract gains an optional, purely additive query parameter — no existing client breaks.
- When card-content search or a second engine is justified, the expected shape is a §28 `search/` module owning a searchable-text query (and possibly §51's provider abstraction) — a body swap behind the same `GET /sets?q=` contract if the parameter survives, a deliberate migration if it does not.

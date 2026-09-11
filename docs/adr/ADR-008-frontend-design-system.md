# ADR-008: Frontend design system

## Context

Two screens exist (`/`, `/login`) and both are unstyled semantic HTML. The frontend arc (AUTH-018..021) is starting, so the styling approach must be decided before form validation (AUTH-019) and API integration (AUTH-020) harden the markup. The constitution lists Tailwind in the preferred stack (§22) and sets the quality bars the UI must meet: state coverage (§56), accessibility minimums (§57), responsive behavior with a mobile-critical study flow (§58), and a deliberately small shared primitive set (§59). Design review establishes the register: DANISOLATION Recall is a product — an instrument used daily to study — not a marketing surface, so consistency and speed earn trust here, and generic visual identity (the default SaaS look) is a real risk to refuse.

## Decision

- Tailwind CSS v4 (`@tailwindcss/postcss`) is the styling layer. Design tokens — palette, spacing rhythm, type scale — are authored CSS-first via `@theme` in `app/globals.css`, so tokens remain plain CSS variables usable with or without utility classes.
- Product register with a "whisper" color strategy: near-neutral surfaces tinted toward one brand hue, and a single accent role reserved for primary actions and focus. The palette is authored in OKLCH; the accent hue references study artifacts (the highlighter/marker tradition) instead of a default tech blue-violet.
- The system font stack serves product UI for now; no webfont in the critical path. A characterful display face is reconsidered when a brand or marketing surface exists (§59).
- Interaction floor for every primitive: visible `:focus-visible` rings (never `outline: none` without a replacement), at least 44px touch targets on coarse pointers, interactive states designed as they arrive (idle, hover, focus, loading, error, disabled — not only idle), labels always visible (placeholders never act as labels), sentence-case copy without exclamation marks, `prefers-reduced-motion` respected, and animation restricted to `transform`/`opacity`.
- Primitives live app-local in `apps/web/src/components/ui/*` (Button, Input, and field error text first) and graduate to `packages/ui` only when a second consumer exists (§21, §59).

## Alternatives

- shadcn/ui, MUI, or Chakra — the fastest path to a finished look; rejected because the identity becomes the library's identity, the dependency surface grows (§81), and preset components fight a token layer (§85).
- CSS Modules with hand-rolled tokens — full control and no new dependency; rejected for MVP velocity and the loss of ecosystem gravity for a solo developer.
- Tailwind v3 — established, but superseded by v4's CSS-first token authoring, which is exactly the property this decision depends on.

## Why

- Utility-first Tailwind is the real-world default for Next.js product teams, and it is the stack the constitution already names (§22).
- The token layer keeps every visual decision in one auditable place: a design change is a token change, not a hunt through components.
- The product register keeps ambition honest — distinctiveness is spent on one accent hue and typographic discipline rather than decoration, matching how the app will actually be used.

## Tradeoffs

- Utility classes in markup reduce template readability; mitigated by confining class-heavy markup inside primitives.
- System fonts cap visual distinctiveness for now — accepted deliberately until a brand surface justifies a display face.
- Tailwind v4 adds a build dependency; justified by the §81 criteria (maintained, healthy ecosystem, no architectural coupling).

## Consequences

- AUTH-018B applies the tokens and first primitives (Button, Input, field error) to the login screen.
- AUTH-019 (React Hook Form + `zodResolver` with `loginSchema`) and AUTH-020 (submission and session handling) build on those primitives; error copy follows recovery-path rules: specific, actionable, never blaming the user.
- `packages/ui` stays empty until a real second consumer appears.
- Design audits (checkup/smell reports) become the review loop once styled screens exist.

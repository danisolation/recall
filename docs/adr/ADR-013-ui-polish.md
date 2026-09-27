# ADR-013: UI polish — deepening the design system

## Context

The MVP ledger is complete (ORG-008 landed the last E2E journey), so this is the first decision taken with the full product in view rather than screen-by-screen. A UI review against the shipped surface finds it faithful to ADR-008 but thin in execution: text links do button jobs across the nav and every card action row, there is not a single icon, animation is absent (the study reveal is an instant show/hide), loading is bare text, the landing page is one sentence, and there is no favicon. The "panel register" and "link register" — the recurring class strings ADR-008's code cites by comment — are copy-pasted constants: 13 register comments across 11 files, the identical panel string re-declared with local aliases. The §59 rule ("don't grow the design system early") has been honored to the point of duplication: the shared foundation exists de facto, just not in code.

Two facts shape the response. The web suite — 170 unit tests and 10 Playwright journeys — pins roles, accessible names, href shapes, and exact copy, and a grep confirms **zero** assertions touch classes, styles, or test ids; a restyle that preserves semantics is therefore nearly free test-wise, and the suite will *guard* the polish rather than fight it. And the user has set the direction explicitly: deepen the existing paper identity (no component-library reskin), cover the whole app foundation-first, and keep motion subtle and functional. The product register stands — this is still an instrument used daily, and the polish must serve speed and trust, not decoration.

## Decision

- **This ADR amends ADR-008; nothing here supersedes it.** Tailwind v4 CSS-first tokens, the OKLCH paper/marker palette, the whisper color strategy, the a11y floor, and the marker-rationing rule all stand unchanged.
- **Icons: `lucide-react` is adopted as the single new runtime dependency.** It passes the §81 criteria (maintained, healthy ecosystem, no architectural coupling), is tree-shaken per-icon, and its 2px stroke style matches the ink borders. Icons are decorative (`aria-hidden`) and always sit **beside visible text labels** — no icon-only controls (§57), which also keeps every accessible name stable.
- **The registers become real code.** `components/ui/panel.tsx` (a `Panel` component plus an exported `panelClassName` for non-section elements) and `components/ui/text-link.tsx` (a `TextLink` plus `linkClassName`, with a `variant="button"` for nav actions) replace the duplicated strings. This is not growth of the foundation — it is the §59 foundation finally written down; centralizing deletes the duplication instead of adding a layer.
- **Motion policy:** CSS-only, `transform`/`opacity` only, 150–250ms, authored once in `globals.css` (keyframes and utilities), so everything dies under the existing global `prefers-reduced-motion` kill-switch. No JavaScript animation library; no hydration risk, because server and client render identical markup and animation is state-after-paint.
- **What does not change:** URL state (§23) including the zero-client-JS search form; inline two-step confirm swaps (no dialogs); `router.refresh()` after mutations (§25); always-visible labels; the system font stack (ADR-008's clause holds — hierarchy comes from size and weight); dark mode (deferred — the paper palette is light-native, and a later dark theme is a token-file change, not a rewrite); toasts (inline `FieldError` panels remain the error register).
- **The phase-wide test invariant:** visible copy, accessible names, href shapes, and DOM roles survive unchanged; icons and aria attributes are additive only. Any task that must break a pinned string justifies it in its ledger entry and repairs the test in the same task.

## Alternatives

- **shadcn/ui or Radix reskin** — the fastest "finished look"; rejected again for ADR-008's reasons (the identity becomes the library's identity, dependency surface grows, preset components fight the token layer), and nothing in the user's direction asks for it.
- **Bold expressive rebrand** — offered and declined: the paper identity is distinctive; the complaint is execution depth, not concept.
- **Icon-only action rows with tooltips** — smaller markup; rejected on §57 (labels always visible) and because the tests pin names.
- **Modal confirms via `<dialog>`** — more conventional; rejected: the inline swaps are already accessible, preserve all names and hrefs, and avoid focus-trap machinery the product has not earned.
- **Centralizing registers into `packages/ui`** — premature under §21/§59 (no second consumer); app-local `components/ui` exports suffice until one exists.
- **Framer-motion** — richer animation; rejected: CSS covers the agreed subtle motion with zero dependency and zero hydration risk.

## Why

- The "basic" complaint is a depth problem, and the deltas users can see — real buttons, icons, motion, designed waiting states — require no new architecture, only the discipline ADR-008 already established applied one layer deeper.
- Centralizing the registers converts a 13-file edit into a 1-file edit, which is the precondition for every later task in the phase being cheap and visually consistent.
- The frozen-copy invariant converts a restyle from a test-rewrite project into a near-zero-churn one; the suite becomes the polish's safety net.
- lucide-react's stroke weight visually matches the existing 2px ink borders, so the icon layer reads as part of the identity rather than an import.

## Tradeoffs

- One new runtime dependency — the no-new-deps default is overridden by the explicit UI/UX request; bounded to exactly one, imported per-icon.
- UX-002's centralization touches ~11 files at once — mechanical and semantics-free, verified by the untouched suite.
- No dark mode in this phase is a visible miss for some users; deferred deliberately, with the OKLCH token layer keeping the future cost to a palette file.
- The 3D card flip is the riskiest motion under reduced-motion; the global kill-switch handles it, and UX-004 verifies the collapse path.

## Consequences

- The phase executes as UX-002 (registers), UX-003 (icons + button-variant nav links + chips), UX-004 (study screen: flip, progress bar, keyboard shortcuts), UX-005 (progress stat panels), UX-006 (landing/auth), UX-007 (skeletons, favicon, metadata), UX-008 (E2E + docs sweep).
- The register comments retire in favor of imports; `ARCHITECTURE.md`'s decision table gains this ADR's row in UX-008.
- Per-task test budget: zero expected changes for UX-002/003/005/006/007 (names and copy preserved), additive tests only in UX-004 (progressbar role, keyboard shortcuts — genuinely new behavior).
- Future options stay recorded: dark mode as a token swap, a display webfont under ADR-008's own reconsideration clause when a brand surface exists.

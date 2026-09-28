# ADR-018: Whole-app visual redesign — claymorphism identity

## Context

`AGENT_RULES.md` §2/§4 forbid implementing a large request in one turn, and a redesign of all ten pages is the clearest such case in this project: it touches every route, the design-token layer, the shared `components/ui` primitives, and the copy/accessible-name assertions that ADR-013 deliberately froze and the E2E journeys depend on. Per §4 one atomic task is executed per request, and per the house pattern a phase opens with an ADR so the visual decisions are recorded once, before any page depends on them.

The trigger was a full-app UI/UX redesign. The existing visual identity is ADR-008 (warm card-stock paper surfaces, a highlighter-marker accent, sober system sans) deepened by ADR-013 (real `components/ui` registers, `lucide-react` icons beside unchanged labels, CSS-only transform/opacity motion, copy/roles frozen for the test suite). Those two ADRs are coherent and are not wrong — but they describe a deliberately restrained, paper-like product voice, and the redesign directive is an explicit decision to move away from it. The direction was chosen deliberately over continuing to evolve the existing identity, so this ADR records that as a **superseding** decision rather than an amendment.

## Decision

- **The visual identity becomes the claymorphism system.** Soft 3D surfaces, 16–24px radii, 3–4px borders, inner+outer double shadows, pastel-tinted surfaces, and soft-press transitions. ADR-008 and ADR-013 are superseded for *visual* concerns; ADR-013's non-visual outcomes (icons never replace labels, centralized registers, reduced-motion kill-switch, frozen accessible names) are **retained** and become the guardrails the restyle must not violate.
- **The palette is adopted as generated**, verified for contrast rather than trusted: primary `#7C3AED` (5.70:1 with white), secondary `#8B5CF6` (4.97:1 with black), accent `#059669` (5.58:1 with black), muted-foreground `#475569` on the `#FAF5FF` background (7.07:1), foreground `#0F172A`. All pairs clear 4.5:1 for normal text. The `on-secondary`/`on-accent` = `#000000` pairings in the generated output are **kept** — white on those two would fail at 3.77:1, so the generated choice is the accessible one, not an error to "fix".
- **Typography adopts Baloo 2 (display) / Comic Neue (body)**, replacing the system sans stack. This is the most consequential choice in the ADR and it is recorded with its tradeoff: it moves the product's voice toward playful/educational and is a poor fit for adult dense-reading surfaces. It is adopted because the redesign directive chose the generated system wholesale, not because the analysis favored it.
- **The redesign is token-first, page-later.** The visual language is introduced once, in `globals.css` and the `components/ui` primitives, so pages are then re-skinned by class changes rather than by re-implementing markup ten times. No page is redesigned before the tokens it depends on exist.
- **Accessibility is a constraint, not a phase.** Every visual decision is checked against §57 and the skill's checklist: contrast ≥4.5:1 in both modes, visible focus, decorative icons `aria-hidden`, sequential heading levels, no color-only signalling, `prefers-reduced-motion` honored, 44px minimum touch targets. A contrast or focus regression fails the task.
- **Frozen assertions are updated deliberately, never silently.** Where a restyle changes copy or an accessible name, the component spec and the E2E journey are updated in the same task with the reason recorded — a mass find-and-replace of assertions is the failure mode this ADR exists to prevent.

## Alternatives

- **Evolve ADR-008/ADR-013 instead** (warm paper, refined hierarchy, no rebrand) — the lower-risk path, preserving every frozen assertion and the sober voice. Rejected by explicit direction: the ask was a redesign, not a polish.
- **Redesign page-by-page, ad hoc, without an ADR** — fastest to first pixel, but each page would invent its own shadows and radii and the app would drift into three visual languages. This is why the phase opens with this record and the tokens land first.
- **Adopt the generated "Product Demo + Features" landing pattern for the home page** — it is a marketing-page structure (video center, testimonial, CTA blocks) and does not match a signed-in application's home route, which shows the user's account and logout control. Rejected; the pattern was a category match on "product demo", not a fit for this route.
- **Claymorphism's 3–4px borders and heavy double shadows as literal spec** — the style's own guidance flags `accessibility: risk:conditional`. Borders and shadows are adopted as tokens with the contrast and focus checks enforced per task, rather than applied blindly.

## Why

- Ten pages restyled in one turn would produce a diff nobody can review (§3, §6) and would violate §4. Opening a phase keeps the work honest.
- Token-first makes the visual change reviewable as one small diff instead of ten entangled page diffs, and it is the only order in which every intermediate state builds (§12's incrementality).
- Recording the contrast verification means the palette is adopted on evidence, not on the generator's authority.
- Retaining ADR-013's accessibility outcomes while superseding its visuals keeps the redesign from silently discarding hard-won, test-pinned correctness.

## Tradeoffs

- Typography is the accepted regression: a rounded children's-display face is less efficient for the dense card text and history lists an adult user actually reads. Recorded, not hidden; a future slice can pair Baloo 2 for display with a more neutral body face.
- Dark mode is **out of scope for the initial restyle**: the generated system rates dark support "conditional", and shipping light-only while claiming a full redesign would be the same honesty failure this project avoids elsewhere. Dark mode is a separate, explicit slice.
- Ten pages, the token layer, the primitive restyle, and the assertion updates exceed one task; the phase is decomposed and executed one task per turn.
- Soft 3D shadows cost paint area; on long lists the shadow cost is a real (if small) rendering consideration, measured before any optimization (§62).

## Consequences

- `globals.css`'s `@theme` block is replaced; the `paper`/`ink`/`marker`/`alert` tokens are removed, and every `ui/` primitive plus every page is re-skinned in subsequent tasks.
- ADR-008 and ADR-013 are marked superseded for visual concerns; ADR-013's accessibility and icon rules are explicitly retained and remain binding.
- E2E journeys that assert on copy or accessible names will need explicit, individually justified updates — expected, and tracked per task.
- The phase is decomposed in `docs/TASKS.md` as `REDESIGN-001..00n`, executed one task per turn, TDD RED-first, no commit or push unless asked.

# ADR-004: Validation and shared contracts

## Context

External input must always be validated, and every external request needs an explicit schema and documented errors (§53). The constitution prefers shared contracts in `packages/contracts` when they can prevent drift between apps (§21, §53) and lists Zod in the project stack (§22). Registration currently validates with a Zod schema (`registerSchema`) parsed manually inside `AuthController`, with the input type derived via `z.infer`. The web app will need the same shapes for the auth screens (AUTH-017+), which makes schema duplication a real drift risk.

## Decision

- Zod is the single validation language for both apps.
- Cross-app request schemas live in `packages/contracts` as `@danisolation-recall/contracts`.
- NestJS integration uses `nestjs-zod`: schemas are wrapped with `createZodDto` and validated by a Zod validation pipe instead of per-controller `safeParse`.
- Unknown fields are stripped from request bodies; validation failures keep the stable `VALIDATION_ERROR` code shape (§54).

## Alternatives

- class-validator DTOs with a global `ValidationPipe` — Nest's official default; rejected because it duplicates the shape (DTO class plus a separate TS type) and depends on class-transformer and decorator metadata.
- Controller-level `safeParse` (the previous approach) — explicit and dependency-free, but manual per endpoint, keeps schemas app-local, and leaves response typing to convention.
- zod-nestjs / @anatine/zod-nestjs — comparable bridges; `nestjs-zod` is the most widely used and maintained.

## Why

- One validation language across web and API prevents drift between form validation and endpoint validation (§53).
- `z.infer` derives static types from the same declaration that performs runtime validation.
- `nestjs-zod` keeps controllers thin without abandoning Zod, and unknown-key stripping matches the whitelist behavior expected of API boundaries.

## Tradeoffs

- `nestjs-zod` is community-maintained, not an official Nest package; upgrades track both Nest and Zod majors.
- A new package must earn its "real responsibility" (§21) — justified here by the upcoming frontend consumption of the same schemas.
- OpenAPI documentation requires nestjs-zod's Swagger support instead of class-validator's built-in decorator integration.

## Consequences

- `registerSchema` and `RegisterInput` move to `packages/contracts` (CONTRACTS-002); the API imports them as a workspace dependency.
- `AuthController` is retrofitted to DTO plus validation pipe (CONTRACTS-003).
- The login schema (AUTH-010) is created directly in `packages/contracts`.
- Frontend auth screens consume the same schemas (AUTH-017+).

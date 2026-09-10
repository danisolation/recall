# ADR-003: ORM Selection

## Status

Accepted

## Context

The API needs a type-safe way to access PostgreSQL while keeping SQL understandable. Two candidates were evaluated per constitution §31: Drizzle and Prisma.

## Decision

Use Drizzle as the ORM for the database layer.

## Alternatives

- Drizzle — thin, SQL-close query builder with full type safety.
- Prisma — schema-first ORM with strong developer experience and a visual Studio.

## Why

- Drizzle keeps SQL visible and does not become a black box.
- It provides type safety, migrations, transactions, and PostgreSQL support.
- Its lower abstraction level supports the goal of understanding SQL, indexes, constraints, and query plans.

## Tradeoffs

- Prisma has a more polished schema-first workflow and Studio UI.
- Drizzle requires more explicit SQL knowledge, which is intentional for this project.

## Consequences

- Schema is defined in TypeScript in `packages/database/src/schema.ts`.
- Migrations are generated with drizzle-kit and committed to the repository.
- The API consumes the Drizzle client from `packages/database`.

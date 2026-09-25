import { Inject, Injectable } from "@nestjs/common";
import {
  and,
  asc,
  desc,
  eq,
  gt,
  gte,
  lt,
  lte,
  sql,
  cards,
  studySets,
} from "@danisolation-recall/database";
import type {
  CreateCardInput,
  UpdateCardInput,
} from "@danisolation-recall/contracts";
import { DATABASE_PROVIDER, type Database } from "../database/database.module";

export type Card = typeof cards.$inferSelect;

@Injectable()
export class CardsRepository {
  constructor(@Inject(DATABASE_PROVIDER) private readonly db: Database) {}

  // Appends the card to the end of the set's study order. The set must belong
  // to the owner; a foreign or unknown set is indistinguishable from missing.
  async create(
    setId: number,
    ownerId: number,
    input: CreateCardInput,
  ): Promise<Card | null> {
    return this.db.transaction(async (tx) => {
      const [set] = await tx
        .select({ id: studySets.id })
        .from(studySets)
        .where(and(eq(studySets.id, setId), eq(studySets.ownerId, ownerId)))
        .limit(1);

      if (!set) {
        return null;
      }

      const [last] = await tx
        .select({ position: cards.position })
        .from(cards)
        .where(eq(cards.setId, setId))
        .orderBy(desc(cards.position))
        .limit(1);

      const [card] = await tx
        .insert(cards)
        .values({
          setId,
          front: input.front,
          back: input.back,
          position: (last?.position ?? 0) + 1,
        })
        .returning();

      return card ?? null;
    });
  }

  async findById(
    cardId: number,
    setId: number,
    ownerId: number,
  ): Promise<Card | null> {
    const [row] = await this.db
      .select({ card: cards })
      .from(cards)
      .innerJoin(studySets, eq(cards.setId, studySets.id))
      .where(
        and(
          eq(cards.id, cardId),
          eq(cards.setId, setId),
          eq(studySets.ownerId, ownerId),
        ),
      )
      .limit(1);

    return row?.card ?? null;
  }

  // Returns null when the set is missing or foreign; an owned but empty set is
  // an empty list, not a 404.
  async listBySet(
    setId: number,
    ownerId: number,
    page: { limit: number; offset: number },
  ): Promise<Card[] | null> {
    const [set] = await this.db
      .select({ id: studySets.id })
      .from(studySets)
      .where(and(eq(studySets.id, setId), eq(studySets.ownerId, ownerId)))
      .limit(1);

    if (!set) {
      return null;
    }

    return this.db
      .select()
      .from(cards)
      .where(eq(cards.setId, setId))
      .orderBy(asc(cards.position), asc(cards.id))
      .limit(page.limit)
      .offset(page.offset);
  }

  async update(
    cardId: number,
    setId: number,
    ownerId: number,
    input: UpdateCardInput,
  ): Promise<Card | null> {
    const values: Partial<typeof cards.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (input.front !== undefined) {
      values.front = input.front;
    }

    if (input.back !== undefined) {
      values.back = input.back;
    }

    const [row] = await this.db
      .update(cards)
      .set(values)
      .where(
        and(
          eq(cards.id, cardId),
          eq(cards.setId, setId),
          sql`exists (select 1 from ${studySets} where ${studySets.id} = ${cards.setId} and ${studySets.ownerId} = ${ownerId})`,
        ),
      )
      .returning();

    return row ?? null;
  }

  async delete(cardId: number, setId: number, ownerId: number): Promise<boolean> {
    const deleted = await this.db
      .delete(cards)
      .where(
        and(
          eq(cards.id, cardId),
          eq(cards.setId, setId),
          sql`exists (select 1 from ${studySets} where ${studySets.id} = ${cards.setId} and ${studySets.ownerId} = ${ownerId})`,
        ),
      )
      .returning({ id: cards.id });

    return deleted.length > 0;
  }

  // Moves the card to targetPosition, shifting the siblings between its old
  // and new place. Owns the ordering invariant (CARD-001): one transaction,
  // positions stay a dense 1..n sequence.
  async move(
    cardId: number,
    setId: number,
    ownerId: number,
    targetPosition: number,
  ): Promise<Card | null> {
    return this.db.transaction(async (tx) => {
      const [current] = await tx
        .select({ card: cards })
        .from(cards)
        .innerJoin(studySets, eq(cards.setId, studySets.id))
        .where(
          and(
            eq(cards.id, cardId),
            eq(cards.setId, setId),
            eq(studySets.ownerId, ownerId),
          ),
        )
        .limit(1);

      if (!current) {
        return null;
      }

      const siblings = await tx
        .select({ position: cards.position })
        .from(cards)
        .where(eq(cards.setId, setId));
      const total = siblings.length;

      const target = Math.min(Math.max(1, targetPosition), total);
      const from = current.card.position;

      if (target !== from) {
        if (target < from) {
          await tx
            .update(cards)
            .set({ position: sql`${cards.position} + 1` })
            .where(
              and(
                eq(cards.setId, setId),
                gte(cards.position, target),
                lt(cards.position, from),
              ),
            );
        } else {
          await tx
            .update(cards)
            .set({ position: sql`${cards.position} - 1` })
            .where(
              and(
                eq(cards.setId, setId),
                gt(cards.position, from),
                lte(cards.position, target),
              ),
            );
        }
      }

      const [moved] = await tx
        .update(cards)
        .set({ position: target, updatedAt: new Date() })
        .where(eq(cards.id, cardId))
        .returning();

      return moved ?? null;
    });
  }
}

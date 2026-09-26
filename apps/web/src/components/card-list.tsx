import Link from "next/link";
import { DeleteCardButton } from "../app/(protected)/sets/[id]/delete-card-button";
import { MoveCardButton } from "../app/(protected)/sets/[id]/move-card-button";
import type { Card } from "@/lib/cards";

// Same link register as the dashboard's "New set" link.
const textLink =
  "rounded-sm font-medium underline underline-offset-4 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

// Same panel register as SetList's items (ADR-008).
const item =
  "rounded-card border border-ink/10 bg-card p-4 shadow-[4px_4px_0_0] shadow-ink/15 sm:p-6";

export function CardList({ cards }: { cards: Card[] }) {
  if (cards.length === 0) {
    return (
      <section className={item}>
        <p className="text-ink-soft">
          No cards yet. Add your first card to start studying.
        </p>
      </section>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {cards.map((card, index) => {
        // Move targets are the neighbouring positions, not position ± 1:
        // deletes leave gaps (CARD-007), and the neighbours' positions are
        // what the reorder contract needs to swap past them. A boundary card
        // has no neighbour, which is exactly its disabled state.
        const prev = index > 0 ? cards[index - 1] : undefined;
        const next = index < cards.length - 1 ? cards[index + 1] : undefined;

        return (
          <li key={card.id} className={item}>
            <span className="block font-medium">{card.front}</span>
            <span className="mt-1 block text-sm text-ink-soft">
              {card.back}
            </span>
            <div className="mt-2 flex flex-wrap items-start gap-3">
              <MoveCardButton
                setId={card.setId}
                cardId={card.id}
                targetPosition={prev?.position ?? card.position}
                direction="up"
                disabled={!prev}
              />
              <MoveCardButton
                setId={card.setId}
                cardId={card.id}
                targetPosition={next?.position ?? card.position}
                direction="down"
                disabled={!next}
              />
              <Link href={`?edit=${card.id}`} className={`${textLink} text-sm`}>
                Edit
              </Link>
              <DeleteCardButton setId={card.setId} cardId={card.id} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

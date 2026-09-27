import { Panel, panelClassName } from "@/components/ui/panel";
import { TextLink } from "@/components/ui/text-link";
import { DeleteCardButton } from "../app/(protected)/sets/[id]/delete-card-button";
import { MoveCardButton } from "../app/(protected)/sets/[id]/move-card-button";
import type { Card } from "@/lib/cards";

export function CardList({ cards }: { cards: Card[] }) {
  if (cards.length === 0) {
    return (
      <Panel>
        <p className="text-ink-soft">
          No cards yet. Add your first card to start studying.
        </p>
      </Panel>
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
          <li key={card.id} className={panelClassName}>
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
              <TextLink href={`?edit=${card.id}`} className="text-sm">
                Edit
              </TextLink>
              <DeleteCardButton setId={card.setId} cardId={card.id} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, moveCard } from "@/lib/api";
import { FieldError } from "@/components/ui/field-error";
import { linkClassName } from "@/components/ui/text-link";

export function MoveCardButton({
  setId,
  cardId,
  targetPosition,
  direction,
  disabled = false,
}: {
  setId: number;
  cardId: number;
  targetPosition: number;
  direction: "up" | "down";
  disabled?: boolean;
}) {
  const router = useRouter();
  const [isMoving, setIsMoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Success and a 404 for an already-deleted card both end with the list
  // being refetched; the server response is the source of the new order.
  async function handleClick() {
    setIsMoving(true);

    try {
      await moveCard(setId, cardId, targetPosition);
      router.refresh();
    } catch (err) {
      setIsMoving(false);

      if (err instanceof ApiError && err.code === "CARD_NOT_FOUND") {
        router.refresh();
      } else {
        setError("Moving the card failed. Try again.");
      }
    }
  }

  return (
    <span className="flex flex-col gap-1">
      <button
        type="button"
        className={`${linkClassName} disabled:opacity-50 disabled:cursor-not-allowed`}
        disabled={disabled || isMoving}
        onClick={handleClick}
      >
        {direction === "up" ? "Move up" : "Move down"}
      </button>
      {error ? <FieldError>{error}</FieldError> : null}
    </span>
  );
}

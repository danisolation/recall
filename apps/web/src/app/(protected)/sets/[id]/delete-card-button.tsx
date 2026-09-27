"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { ApiError, deleteCard } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { linkClassName } from "@/components/ui/text-link";

export function DeleteCardButton({
  setId,
  cardId,
}: {
  setId: number;
  cardId: number;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The set page stays valid after the card is gone, so refreshing the
  // server components removes it from the list — after success and after a
  // 404 for a card already deleted elsewhere (the goal is achieved either
  // way, mirroring SET-013).
  async function handleConfirm() {
    setIsDeleting(true);

    try {
      await deleteCard(setId, cardId);
      router.refresh();
    } catch (err) {
      setIsDeleting(false);

      if (err instanceof ApiError && err.code === "CARD_NOT_FOUND") {
        router.refresh();
      } else {
        setError("Deleting the card failed. Try again.");
      }
    }
  }

  if (!confirming) {
    return (
      <button
        type="button"
        className={linkClassName}
        onClick={() => setConfirming(true)}
      >
        <Trash2 aria-hidden className="h-4 w-4 shrink-0" />
        Delete
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-ink-soft">
        Delete this card? This cannot be undone.
      </p>
      {error ? <FieldError>{error}</FieldError> : null}
      <div className="flex gap-3">
        <Button variant="secondary" onClick={handleConfirm} disabled={isDeleting}>
          Confirm delete
        </Button>
        <Button
          variant="secondary"
          onClick={() => setConfirming(false)}
          disabled={isDeleting}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

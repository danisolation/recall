"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, deleteSet } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";

export function DeleteSetButton({ setId }: { setId: number }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setIsDeleting(true);

    try {
      await deleteSet(setId);
      router.push("/dashboard");
    } catch (err) {
      setIsDeleting(false);

      if (err instanceof ApiError && err.code === "SET_NOT_FOUND") {
        // The set is already gone; the dashboard reflects that.
        router.push("/dashboard");
      } else {
        setError("Deleting your set failed. Try again.");
      }
    }
  }

  if (!confirming) {
    return (
      <Button variant="secondary" onClick={() => setConfirming(true)}>
        Delete set
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-ink-soft">
        Delete this set? This cannot be undone.
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

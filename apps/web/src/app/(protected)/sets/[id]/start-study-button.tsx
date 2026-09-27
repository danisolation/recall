"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play } from "lucide-react";
import { ApiError, startSession } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";

export function StartStudyButton({ setId }: { setId: number }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStart() {
    setIsPending(true);
    setError(null);

    try {
      const session = await startSession({ setId });
      router.push(`/study/${session.id}`);
    } catch (err) {
      setIsPending(false);

      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Starting the study session failed. Try again.");
      }
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button onClick={handleStart} disabled={isPending}>
        <Play aria-hidden className="h-4 w-4 shrink-0 fill-current" />
        {isPending ? "Starting…" : "Study"}
      </Button>
      {error ? <FieldError>{error}</FieldError> : null}
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { logoutUser } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        variant="secondary"
        disabled={isPending}
        onClick={async () => {
          setIsPending(true);
          setError(null);

          try {
            await logoutUser();
            // The API cleared the cookie; re-fetch the page so the server
            // renders it as signed out instead of a stale cached tree.
            router.replace("/login");
            router.refresh();
          } catch {
            setError("Logging out failed. Try again.");
            setIsPending(false);
          }
        }}
      >
        {isPending ? "Logging out…" : "Log out"}
      </Button>
      <FieldError>{error}</FieldError>
    </div>
  );
}

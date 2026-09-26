"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { updateCardSchema } from "@danisolation-recall/contracts";
import { ApiError, updateCard } from "@/lib/api";
import type { Card } from "@/lib/cards";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { FormField } from "@/components/ui/form-field";

// Same panel register as the card list items (ADR-008).
const panel =
  "rounded-card border border-ink/10 bg-card p-4 shadow-[4px_4px_0_0] shadow-ink/15 sm:p-6";

export function EditCardForm({ setId, card }: { setId: number; card: Card }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(updateCardSchema),
    defaultValues: { front: card.front, back: card.back },
  });

  // Leaving edit mode changes the URL (?edit removed), so the navigation
  // itself re-renders the server components with fresh data — no explicit
  // refresh needed.
  const leaveEditMode = () => router.push(`/sets/${setId}`);

  return (
    <section className={panel}>
      <form
        className="flex flex-col gap-4"
        noValidate
        onSubmit={handleSubmit(async (values) => {
          try {
            await updateCard(setId, card.id, values);
            leaveEditMode();
          } catch (error) {
            if (error instanceof ApiError) {
              setError("root", { message: error.message });
            } else {
              setError("root", {
                message: "Saving your changes failed. Try again.",
              });
            }
          }
        })}
      >
        <FormField
          label="Front"
          id="edit-card-front"
          autoComplete="off"
          error={errors.front?.message}
          {...register("front")}
        />
        <FormField
          label="Back"
          id="edit-card-back"
          autoComplete="off"
          error={errors.back?.message}
          {...register("back")}
        />
        {errors.root?.message ? (
          <FieldError>{errors.root.message}</FieldError>
        ) : null}
        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            Save changes
          </Button>
          <Button type="button" variant="secondary" onClick={leaveEditMode}>
            Cancel
          </Button>
        </div>
      </form>
    </section>
  );
}

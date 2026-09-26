"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { createCardSchema } from "@danisolation-recall/contracts";
import { ApiError, createCard } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { FormField } from "@/components/ui/form-field";

// Same panel register as the card list items (ADR-008).
const panel =
  "rounded-card border border-ink/10 bg-card p-4 shadow-[4px_4px_0_0] shadow-ink/15 sm:p-6";

export function CreateCardForm({ setId }: { setId: number }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createCardSchema),
  });

  return (
    <section className={panel}>
      <form
        className="flex flex-col gap-4"
        noValidate
        onSubmit={handleSubmit(async (values) => {
          try {
            await createCard(setId, values);
            // The card list is server-rendered; refetch it (§25).
            reset();
            router.refresh();
          } catch (error) {
            if (error instanceof ApiError) {
              setError("root", { message: error.message });
            } else {
              setError("root", {
                message: "Adding the card failed. Try again.",
              });
            }
          }
        })}
      >
        <FormField
          label="Front"
          id="card-front"
          autoComplete="off"
          error={errors.front?.message}
          {...register("front")}
        />
        <FormField
          label="Back"
          id="card-back"
          autoComplete="off"
          error={errors.back?.message}
          {...register("back")}
        />
        {errors.root?.message ? (
          <FieldError>{errors.root.message}</FieldError>
        ) : null}
        <Button type="submit" disabled={isSubmitting}>
          Add card
        </Button>
      </form>
    </section>
  );
}

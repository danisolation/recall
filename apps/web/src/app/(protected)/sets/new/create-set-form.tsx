"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { createSetSchema } from "@danisolation-recall/contracts";
import { ApiError, createSet } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { FormField } from "@/components/ui/form-field";

export function CreateSetForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createSetSchema),
  });

  return (
    <form
      className="flex flex-col gap-4"
      noValidate
      onSubmit={handleSubmit(async (values) => {
        try {
          const set = await createSet(values);
          router.push(`/sets/${set.id}`);
        } catch (error) {
          if (error instanceof ApiError) {
            setError("root", { message: error.message });
          } else {
            setError("root", {
              message: "Creating your set failed. Try again.",
            });
          }
        }
      })}
    >
      <FormField
        label="Title"
        id="title"
        autoComplete="off"
        error={errors.title?.message}
        {...register("title")}
      />
      <FormField
        label="Description"
        id="description"
        autoComplete="off"
        error={errors.description?.message}
        {...register("description")}
      />
      {errors.root?.message ? (
        <FieldError>{errors.root.message}</FieldError>
      ) : null}
      <Button type="submit" disabled={isSubmitting}>
        Create set
      </Button>
    </form>
  );
}

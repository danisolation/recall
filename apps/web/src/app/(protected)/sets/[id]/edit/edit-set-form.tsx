"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { updateSetSchema } from "@danisolation-recall/contracts";
import { ApiError, updateSet } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { FormField } from "@/components/ui/form-field";
import type { StudySet } from "@/lib/sets";

export function EditSetForm({ set }: { set: StudySet }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(updateSetSchema),
    defaultValues: {
      title: set.title,
      description: set.description ?? "",
    },
  });

  return (
    <form
      className="flex flex-col gap-4"
      noValidate
      onSubmit={handleSubmit(async (values) => {
        try {
          await updateSet(set.id, values);
          router.push(`/sets/${set.id}`);
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
        Save changes
      </Button>
    </form>
  );
}

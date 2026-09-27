"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { setTagsSchema, updateSetSchema } from "@danisolation-recall/contracts";
import { ApiError, replaceTags, updateSet } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { FormField } from "@/components/ui/form-field";
import type { StudySet } from "@/lib/sets";

export function EditSetForm({
  set,
  initialTags = [],
}: {
  set: StudySet;
  initialTags?: string[];
}) {
  const router = useRouter();
  const [tags, setTags] = useState(initialTags.join(", "));
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
          const tagNames = tags
            .split(",")
            .map((name) => name.trim())
            .filter((name) => name.length > 0);
          const parsedTags = setTagsSchema.safeParse({ tags: tagNames });

          if (!parsedTags.success) {
            setError("root", {
              message: parsedTags.error.issues[0]?.message ?? "Enter valid tags",
            });
            return;
          }

          // Both calls are idempotent, so a failure leaves the form filled
          // and a resubmit safely retries the whole save (§55).
          await updateSet(set.id, {
            title: values.title,
            description: values.description,
          });
          await replaceTags(set.id, { tags: parsedTags.data.tags });
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
      <FormField
        label="Tags"
        id="tags"
        autoComplete="off"
        placeholder="biology, exam prep"
        value={tags}
        onChange={(event) => setTags(event.target.value)}
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

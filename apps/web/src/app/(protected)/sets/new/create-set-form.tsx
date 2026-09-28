"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { createSetSchema, setTagsSchema } from "@danisolation-recall/contracts";
import { ApiError, createSet, replaceTags } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { FormField } from "@/components/ui/form-field";

export function CreateSetForm() {
  const router = useRouter();
  // Create-then-tag is a two-step save (ADR-012's replace contract needs
  // the new set's id). Remembering the id makes a retry after a tag
  // failure re-run only the tags — the set is never created twice.
  const createdIdRef = useRef<number | null>(null);
  const [tags, setTags] = useState("");
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

          if (createdIdRef.current === null) {
            const set = await createSet({
              title: values.title,
              description: values.description,
            });
            createdIdRef.current = set.id;
          }

          if (parsedTags.data.tags.length > 0) {
            await replaceTags(createdIdRef.current, {
              tags: parsedTags.data.tags,
            });
          }

          router.push(`/sets/${createdIdRef.current}`);
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
        Create set
      </Button>
    </form>
  );
}

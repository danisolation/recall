import { z } from "zod";

// ADR-012: a set carries at most 10 tags; each name is trimmed, then must be
// 1–50 characters. The repository owns case-insensitive dedupe — the schema
// bounds the payload, the repository owns the invariant.
const tagNameSchema = z
  .string({
    error: "Enter a tag name",
  })
  .transform((value) => value.trim())
  .pipe(
    z
      .string()
      .min(1, "Enter a tag name")
      .max(50, "Use 50 characters or fewer per tag"),
  );

export const setTagsSchema = z.object({
  tags: z.array(tagNameSchema).max(10, "Use at most 10 tags per set"),
});

export type SetTagsInput = z.infer<typeof setTagsSchema>;

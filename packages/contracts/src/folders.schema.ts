import { z } from "zod";

// ADR-014: a folder's name follows the tags naming discipline — trimmed,
// then 1–50 characters. The repository owns the case-insensitive uniqueness
// (the expression index); the schema bounds the payload.
export const folderNameSchema = z
  .string({
    error: "Enter a folder name",
  })
  .transform((value) => value.trim())
  .pipe(
    z
      .string()
      .min(1, "Enter a folder name")
      .max(50, "Use 50 characters or fewer per folder"),
  );

export const createFolderSchema = z.object({
  name: folderNameSchema,
});

export type CreateFolderInput = z.infer<typeof createFolderSchema>;

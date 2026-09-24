import { z } from "zod";

export const createSetSchema = z.object({
  title: z
    .string()
    .transform((value) => value.trim())
    .pipe(
      z
        .string()
        .min(1, "Enter a title")
        .max(255, "Use at most 255 characters"),
    ),
  description: z
    .string()
    .transform((value) => value.trim())
    .pipe(z.string().max(2000, "Use at most 2000 characters"))
    .optional(),
});

export const updateSetSchema = createSetSchema.partial().refine(
  (data) => data.title !== undefined || data.description !== undefined,
  { message: "Nothing to update" },
);

export type CreateSetInput = z.infer<typeof createSetSchema>;
export type UpdateSetInput = z.infer<typeof updateSetSchema>;

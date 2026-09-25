import { z } from "zod";

function cardSide(emptyMessage: string) {
  return z
    .string()
    .transform((value) => value.trim())
    .pipe(
      z
        .string()
        .min(1, emptyMessage)
        .max(2000, "Use at most 2000 characters"),
    );
}

export const createCardSchema = z.object({
  front: cardSide("Enter the front"),
  back: cardSide("Enter the back"),
});

export const updateCardSchema = createCardSchema.partial().refine(
  (data) => data.front !== undefined || data.back !== undefined,
  { message: "Nothing to update" },
);

export type CreateCardInput = z.infer<typeof createCardSchema>;
export type UpdateCardInput = z.infer<typeof updateCardSchema>;

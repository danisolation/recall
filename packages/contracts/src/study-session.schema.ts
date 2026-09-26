import { z } from "zod";

export const startSessionSchema = z.object({
  setId: z
    .number({ error: "Choose a set to study" })
    .int("Choose a set to study")
    .positive("Choose a set to study"),
});

export const reviewSchema = z.object({
  cardId: z
    .number({ error: "Choose a card to answer" })
    .int("Choose a card to answer")
    .positive("Choose a card to answer"),
  correct: z.boolean({ error: "Record your answer" }),
});

export type StartSessionInput = z.infer<typeof startSessionSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;

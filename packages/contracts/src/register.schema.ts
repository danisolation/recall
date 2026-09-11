import { z } from "zod";

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, "Enter your email address")
    .transform((value) => value.trim().toLowerCase())
    .pipe(
      z
        .email("Enter a valid email address")
        .max(255, "Email address is too long"),
    ),
  password: z
    .string()
    .min(8, "Use at least 8 characters")
    .max(128, "Password is too long"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

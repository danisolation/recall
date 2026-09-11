import { z } from "zod";

export const loginSchema = z.object({
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
    .min(1, "Enter your password")
    .max(128, "Password is too long"),
});

export type LoginInput = z.infer<typeof loginSchema>;

import { describe, expect, it } from "vitest";
import { registerSchema } from "./register.schema";

describe("registerSchema", () => {
  it("accepts a valid registration input", () => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      password: "correct horse battery staple",
    });

    expect(result.success).toBe(true);
  });

  it("normalizes the email", () => {
    const result = registerSchema.parse({
      email: "  USER@Example.COM ",
      password: "correct horse battery staple",
    });

    expect(result.email).toBe("user@example.com");
  });

  it("rejects an invalid email", () => {
    const result = registerSchema.safeParse({
      email: "not-an-email",
      password: "correct horse battery staple",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a short password", () => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      password: "short",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an oversized password", () => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      password: "a".repeat(129),
    });

    expect(result.success).toBe(false);
  });

  it("rejects missing fields", () => {
    const result = registerSchema.safeParse({});

    expect(result.success).toBe(false);
  });
});

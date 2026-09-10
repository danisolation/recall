import { describe, expect, it } from "vitest";
import { loginSchema } from "./login.schema";

describe("loginSchema", () => {
  it("accepts a valid login input", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "any-password",
    });

    expect(result.success).toBe(true);
  });

  it("normalizes the email", () => {
    const result = loginSchema.parse({
      email: "  USER@Example.COM ",
      password: "any-password",
    });

    expect(result.email).toBe("user@example.com");
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "any-password",
    });

    expect(result.success).toBe(false);
  });

  it("accepts a password that does not match registration policy", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "short",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "",
    });

    expect(result.success).toBe(false);
  });

  it("rejects missing fields", () => {
    const result = loginSchema.safeParse({});

    expect(result.success).toBe(false);
  });
});

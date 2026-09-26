import { describe, expect, it } from "vitest";
import { reviewSchema, startSessionSchema } from "./study-session.schema";

describe("startSessionSchema", () => {
  it("accepts a valid set id", () => {
    const result = startSessionSchema.safeParse({ setId: 42 });

    expect(result.success).toBe(true);
  });

  it("rejects a missing set id", () => {
    const result = startSessionSchema.safeParse({});

    expect(result.success).toBe(false);
  });

  it("rejects a non-integer set id", () => {
    const result = startSessionSchema.safeParse({ setId: 1.5 });

    expect(result.success).toBe(false);
  });

  it("rejects a zero or negative set id", () => {
    expect(startSessionSchema.safeParse({ setId: 0 }).success).toBe(false);
    expect(startSessionSchema.safeParse({ setId: -1 }).success).toBe(false);
  });

  it("uses the established message register for the set id", () => {
    const result = startSessionSchema.safeParse({ setId: "42" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Choose a set to study");
    }
  });
});

describe("reviewSchema", () => {
  it("accepts a valid review", () => {
    const result = reviewSchema.safeParse({ cardId: 7, correct: true });

    expect(result.success).toBe(true);
  });

  it("accepts an incorrect answer", () => {
    const result = reviewSchema.safeParse({ cardId: 7, correct: false });

    expect(result.success).toBe(true);
  });

  it("rejects a missing card id", () => {
    const result = reviewSchema.safeParse({ correct: true });

    expect(result.success).toBe(false);
  });

  it("rejects a non-integer or negative card id", () => {
    expect(
      reviewSchema.safeParse({ cardId: 1.5, correct: true }).success,
    ).toBe(false);
    expect(
      reviewSchema.safeParse({ cardId: -7, correct: true }).success,
    ).toBe(false);
  });

  it("rejects a missing or non-boolean answer", () => {
    expect(reviewSchema.safeParse({ cardId: 7 }).success).toBe(false);
    expect(
      reviewSchema.safeParse({ cardId: 7, correct: "yes" }).success,
    ).toBe(false);
  });
});

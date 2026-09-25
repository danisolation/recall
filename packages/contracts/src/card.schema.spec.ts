import { describe, expect, it } from "vitest";
import { createCardSchema, updateCardSchema } from "./card.schema";

describe("createCardSchema", () => {
  it("accepts a valid card", () => {
    const result = createCardSchema.safeParse({
      front: "What is mitosis?",
      back: "Cell division producing two identical cells",
    });

    expect(result.success).toBe(true);
  });

  it("trims the front and back", () => {
    const result = createCardSchema.parse({
      front: "  What is mitosis?  ",
      back: "  Cell division producing two identical cells  ",
    });

    expect(result.front).toBe("What is mitosis?");
    expect(result.back).toBe("Cell division producing two identical cells");
  });

  it("rejects an empty front", () => {
    const result = createCardSchema.safeParse({
      front: "",
      back: "Cell division",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a whitespace-only back", () => {
    const result = createCardSchema.safeParse({
      front: "What is mitosis?",
      back: "   ",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a front that is too long", () => {
    const result = createCardSchema.safeParse({
      front: "a".repeat(2001),
      back: "Cell division",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a back that is too long", () => {
    const result = createCardSchema.safeParse({
      front: "What is mitosis?",
      back: "a".repeat(2001),
    });

    expect(result.success).toBe(false);
  });

  it("rejects missing fields", () => {
    const result = createCardSchema.safeParse({});

    expect(result.success).toBe(false);
  });
});

describe("updateCardSchema", () => {
  it("accepts a front-only update", () => {
    const result = updateCardSchema.safeParse({
      front: "Updated front",
    });

    expect(result.success).toBe(true);
  });

  it("accepts a back-only update", () => {
    const result = updateCardSchema.safeParse({
      back: "Updated back",
    });

    expect(result.success).toBe(true);
  });

  it("trims the updated values", () => {
    const result = updateCardSchema.parse({ front: "  Updated front  " });

    expect(result.front).toBe("Updated front");
  });

  it("rejects an empty update", () => {
    const result = updateCardSchema.safeParse({});

    expect(result.success).toBe(false);
  });
});

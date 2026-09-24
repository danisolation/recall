import { describe, expect, it } from "vitest";
import { createSetSchema, updateSetSchema } from "./set.schema";

describe("createSetSchema", () => {
  it("accepts a valid set", () => {
    const result = createSetSchema.safeParse({
      title: "Biology basics",
      description: "Cells, DNA, and heredity",
    });

    expect(result.success).toBe(true);
  });

  it("trims the title and description", () => {
    const result = createSetSchema.parse({
      title: "  Biology basics  ",
      description: "  Cells, DNA, and heredity  ",
    });

    expect(result.title).toBe("Biology basics");
    expect(result.description).toBe("Cells, DNA, and heredity");
  });

  it("accepts a set without a description", () => {
    const result = createSetSchema.safeParse({ title: "Biology basics" });

    expect(result.success).toBe(true);
  });

  it("rejects an empty title", () => {
    const result = createSetSchema.safeParse({ title: "" });

    expect(result.success).toBe(false);
  });

  it("rejects a whitespace-only title", () => {
    const result = createSetSchema.safeParse({ title: "   " });

    expect(result.success).toBe(false);
  });

  it("rejects a title that is too long", () => {
    const result = createSetSchema.safeParse({
      title: "a".repeat(256),
    });

    expect(result.success).toBe(false);
  });

  it("rejects a description that is too long", () => {
    const result = createSetSchema.safeParse({
      title: "Biology basics",
      description: "a".repeat(2001),
    });

    expect(result.success).toBe(false);
  });

  it("rejects missing fields", () => {
    const result = createSetSchema.safeParse({});

    expect(result.success).toBe(false);
  });
});

describe("updateSetSchema", () => {
  it("accepts a title-only update", () => {
    const result = updateSetSchema.safeParse({ title: "New title" });

    expect(result.success).toBe(true);
  });

  it("accepts a description-only update", () => {
    const result = updateSetSchema.safeParse({
      description: "New description",
    });

    expect(result.success).toBe(true);
  });

  it("trims the updated values", () => {
    const result = updateSetSchema.parse({ title: "  New title  " });

    expect(result.title).toBe("New title");
  });

  it("rejects an empty update", () => {
    const result = updateSetSchema.safeParse({});

    expect(result.success).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { setTagsSchema } from "./set-tags.schema";

describe("setTagsSchema", () => {
  it("accepts a list of tag names and trims each", () => {
    const result = setTagsSchema.parse({ tags: ["  Biology  ", "exam prep"] });

    expect(result).toEqual({ tags: ["Biology", "exam prep"] });
  });

  it("accepts an empty list — replacing with nothing clears a set's tags", () => {
    expect(setTagsSchema.parse({ tags: [] })).toEqual({ tags: [] });
  });

  it("rejects a blank name after trimming", () => {
    expect(() => setTagsSchema.parse({ tags: ["Biology", "   "] })).toThrow(
      "Enter a tag name",
    );
  });

  it("rejects names over 50 characters", () => {
    const name = "a".repeat(51);

    expect(() => setTagsSchema.parse({ tags: [name] })).toThrow(
      "Use 50 characters or fewer per tag",
    );
  });

  it("rejects more than 10 tags per set", () => {
    const tags = Array.from({ length: 11 }, (_, index) => `tag ${index}`);

    expect(() => setTagsSchema.parse({ tags })).toThrow(
      "Use at most 10 tags per set",
    );
  });

  it("rejects a missing tags field", () => {
    expect(() => setTagsSchema.parse({})).toThrow();
  });
});

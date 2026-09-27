import { describe, expect, it } from "vitest";
import { createFolderSchema } from "./folders.schema";
import { createSetSchema, updateSetSchema } from "./set.schema";

describe("createFolderSchema", () => {
  it("accepts a folder name and trims it", () => {
    expect(createFolderSchema.parse({ name: "  University  " })).toEqual({
      name: "University",
    });
  });

  it("rejects a blank name after trimming", () => {
    expect(() => createFolderSchema.parse({ name: "   " })).toThrow(
      "Enter a folder name",
    );
  });

  it("rejects names over 50 characters", () => {
    const name = "a".repeat(51);

    expect(() => createFolderSchema.parse({ name })).toThrow(
      "Use 50 characters or fewer per folder",
    );
  });

  it("rejects a missing name", () => {
    expect(() => createFolderSchema.parse({})).toThrow();
  });
});

describe("set placement folderId (ADR-014)", () => {
  it("accepts a folder id, null, or an omitted field on create", () => {
    expect(createSetSchema.parse({ title: "Biology" })).toEqual({
      title: "Biology",
    });
    expect(
      createSetSchema.parse({ title: "Biology", folderId: 7 }),
    ).toEqual({ title: "Biology", folderId: 7 });
    expect(
      createSetSchema.parse({ title: "Biology", folderId: null }),
    ).toEqual({ title: "Biology", folderId: null });
  });

  it("rejects a non-positive or non-integer folder id on create", () => {
    expect(() =>
      createSetSchema.parse({ title: "Biology", folderId: 0 }),
    ).toThrow();
    expect(() =>
      createSetSchema.parse({ title: "Biology", folderId: 1.5 }),
    ).toThrow();
  });

  it("allows a folderId-only update", () => {
    expect(updateSetSchema.parse({ folderId: 7 })).toEqual({ folderId: 7 });
    expect(updateSetSchema.parse({ folderId: null })).toEqual({
      folderId: null,
    });
  });

  it("still rejects an update with nothing to change", () => {
    expect(() => updateSetSchema.parse({})).toThrow("Nothing to update");
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, deleteSet, updateSet } from "./api";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("updateSet", () => {
  it("patches the set with credentials and resolves on success", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      updateSet(42, { title: "New title", description: "" }),
    ).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/sets/42",
      expect.objectContaining({
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New title", description: "" }),
        credentials: "include",
      }),
    );
  });

  it("maps a missing or foreign set to a clear error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ code: "SET_NOT_FOUND", message: "x" }),
      }),
    );

    const error = await updateSet(42, { title: "New title" }).catch(
      (e: unknown) => e,
    );

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).code).toBe("SET_NOT_FOUND");
    await expect(updateSet(42, { title: "New title" })).rejects.toThrow(
      "This set no longer exists.",
    );
  });

  it("maps other failures to a generic error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => null,
      }),
    );

    await expect(updateSet(42, { title: "New title" })).rejects.toThrow(
      "Saving your changes failed. Try again.",
    );
  });
});

describe("deleteSet", () => {
  it("sends the delete with credentials and resolves on success", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 204 });
    vi.stubGlobal("fetch", fetchMock);

    await expect(deleteSet(42)).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/sets/42",
      expect.objectContaining({
        method: "DELETE",
        credentials: "include",
      }),
    );
  });

  it("maps a missing or foreign set to a clear error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ code: "SET_NOT_FOUND", message: "x" }),
      }),
    );

    const error = await deleteSet(42).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).code).toBe("SET_NOT_FOUND");
    await expect(deleteSet(42)).rejects.toThrow(
      "This set no longer exists.",
    );
  });

  it("maps other failures to a generic error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => null,
      }),
    );

    await expect(deleteSet(42)).rejects.toThrow(
      "Deleting your set failed. Try again.",
    );
  });
});

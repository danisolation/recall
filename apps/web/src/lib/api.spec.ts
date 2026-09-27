import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ApiError,
  createFolder,
  deleteCard,
  deleteFolder,
  deleteSet,
  finishSession,
  moveCard,
  renameFolder,
  replaceTags,
  updateSet,
} from "./api";

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

describe("deleteCard", () => {
  it("sends the delete with credentials and resolves on success", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 204 });
    vi.stubGlobal("fetch", fetchMock);

    await expect(deleteCard(42, 7)).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/sets/42/cards/7",
      expect.objectContaining({
        method: "DELETE",
        credentials: "include",
      }),
    );
  });

  it("maps an already-deleted card to a clear error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ code: "CARD_NOT_FOUND", message: "x" }),
      }),
    );

    const error = await deleteCard(42, 7).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).code).toBe("CARD_NOT_FOUND");
    await expect(deleteCard(42, 7)).rejects.toThrow(
      "This card no longer exists.",
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

    await expect(deleteCard(42, 7)).rejects.toThrow(
      "Deleting the card failed. Try again.",
    );
  });
});

describe("moveCard", () => {
  it("patches the card's position with credentials and resolves on success", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", fetchMock);

    await expect(moveCard(42, 7, 2)).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/sets/42/cards/7/position",
      expect.objectContaining({
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position: 2 }),
        credentials: "include",
      }),
    );
  });

  it("maps an already-deleted card to a clear error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ code: "CARD_NOT_FOUND", message: "x" }),
      }),
    );

    const error = await moveCard(42, 7, 2).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).code).toBe("CARD_NOT_FOUND");
    await expect(moveCard(42, 7, 2)).rejects.toThrow(
      "This card no longer exists.",
    );
  });

  it("maps other failures to a generic error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ code: "VALIDATION_ERROR", message: "x" }),
      }),
    );

    await expect(moveCard(42, 7, 2)).rejects.toThrow(
      "Moving the card failed. Try again.",
    );
  });
});

describe("finishSession", () => {
  it("posts the finish with credentials and resolves on success", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", fetchMock);

    await expect(finishSession(5)).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/study-sessions/5/finish",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
      }),
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

    await expect(finishSession(5)).rejects.toThrow(
      "Finishing the session failed. Try again.",
    );
  });
});

describe("replaceTags", () => {
  it("puts the tag names with credentials and resolves on success", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [],
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(replaceTags(42, { tags: ["biology"] })).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/sets/42/tags",
      expect.objectContaining({
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: ["biology"] }),
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

    const error = await replaceTags(42, { tags: ["biology"] }).catch(
      (e: unknown) => e,
    );

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).code).toBe("SET_NOT_FOUND");
    await expect(replaceTags(42, { tags: ["biology"] })).rejects.toThrow(
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

    await expect(replaceTags(42, { tags: ["biology"] })).rejects.toThrow(
      "Saving the tags failed. Try again.",
    );
  });
});

describe("folder management", () => {
  it("creates a folder and returns it", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ id: 7, name: "University" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(createFolder({ name: "University" })).resolves.toEqual({
      id: 7,
      name: "University",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/folders",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "University" }),
        credentials: "include",
      }),
    );
  });

  it("maps a duplicate folder name to a clear error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 409,
        json: async () => ({ code: "FOLDER_NAME_TAKEN", message: "x" }),
      }),
    );

    await expect(createFolder({ name: "University" })).rejects.toThrow(
      "A folder with this name already exists.",
    );
  });

  it("renames a folder through PATCH", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => null,
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      renameFolder(7, { name: "Classes" }),
    ).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/folders/7",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ name: "Classes" }),
      }),
    );
  });

  it("deletes a folder and maps a missing folder to a clear error", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, status: 204, json: async () => null })
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ code: "FOLDER_NOT_FOUND", message: "x" }),
      });
    vi.stubGlobal("fetch", fetchMock);

    await expect(deleteFolder(7)).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/folders/7",
      expect.objectContaining({ method: "DELETE", credentials: "include" }),
    );

    await expect(deleteFolder(7)).rejects.toThrow(
      "This folder no longer exists.",
    );
  });
});

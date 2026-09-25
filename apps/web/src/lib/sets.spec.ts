import { afterEach, describe, expect, it, vi } from "vitest";
import { getSet, listSets } from "./sets";

const { headersMock } = vi.hoisted(() => ({ headersMock: vi.fn() }));

vi.mock("next/headers", () => ({ headers: headersMock }));

const paginatedSets = {
  items: [
    {
      id: 42,
      ownerId: 1,
      title: "Spanish verbs",
      description: null,
      createdAt: "2026-02-01T00:00:00.000Z",
      updatedAt: "2026-02-01T00:00:00.000Z",
    },
  ],
  nextOffset: null,
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("listSets", () => {
  it("returns an empty page without a cookie and never calls the API", async () => {
    headersMock.mockResolvedValue(new Headers());
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(listSets()).resolves.toEqual({ items: [], nextOffset: null });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("forwards the cookie to the API and returns the paginated sets", async () => {
    headersMock.mockResolvedValue(new Headers({ cookie: "session_token=abc" }));
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => paginatedSets,
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(listSets()).resolves.toEqual(paginatedSets);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/sets",
      expect.objectContaining({
        headers: { cookie: "session_token=abc" },
        cache: "no-store",
      }),
    );
  });

  it("throws when the API fails", async () => {
    headersMock.mockResolvedValue(
      new Headers({ cookie: "session_token=abc" }),
    );
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    );

    await expect(listSets()).rejects.toThrow("Loading your sets failed.");
  });
});

describe("getSet", () => {
  const set = {
    id: 42,
    ownerId: 1,
    title: "Spanish verbs",
    description: "Common irregular verbs",
    createdAt: "2026-02-01T00:00:00.000Z",
    updatedAt: "2026-02-01T00:00:00.000Z",
  };

  it("returns null without a cookie and never calls the API", async () => {
    headersMock.mockResolvedValue(new Headers());
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(getSet(42)).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("forwards the cookie to the API and returns the set", async () => {
    headersMock.mockResolvedValue(new Headers({ cookie: "session_token=abc" }));
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => set,
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(getSet(42)).resolves.toEqual(set);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/sets/42",
      expect.objectContaining({
        headers: { cookie: "session_token=abc" },
        cache: "no-store",
      }),
    );
  });

  it("returns null when the set does not exist or is not owned", async () => {
    headersMock.mockResolvedValue(
      new Headers({ cookie: "session_token=abc" }),
    );
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 404 }),
    );

    await expect(getSet(42)).resolves.toBeNull();
  });

  it("throws when the API fails for another reason", async () => {
    headersMock.mockResolvedValue(
      new Headers({ cookie: "session_token=abc" }),
    );
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    );

    await expect(getSet(42)).rejects.toThrow("Loading the set failed.");
  });
});

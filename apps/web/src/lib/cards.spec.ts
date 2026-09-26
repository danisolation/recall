import { afterEach, describe, expect, it, vi } from "vitest";
import { listCards } from "./cards";

const { headersMock } = vi.hoisted(() => ({ headersMock: vi.fn() }));

vi.mock("next/headers", () => ({ headers: headersMock }));

const paginatedCards = {
  items: [
    {
      id: 1,
      setId: 42,
      front: "What is mitosis?",
      back: "Cell division",
      position: 1,
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

describe("listCards", () => {
  it("returns an empty page without a cookie and never calls the API", async () => {
    headersMock.mockResolvedValue(new Headers());
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(listCards(42)).resolves.toEqual({ items: [], nextOffset: null });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("forwards the cookie to the API and returns the paginated cards", async () => {
    headersMock.mockResolvedValue(new Headers({ cookie: "session_token=abc" }));
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => paginatedCards,
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(listCards(42)).resolves.toEqual(paginatedCards);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/sets/42/cards",
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

    await expect(listCards(42)).rejects.toThrow("Loading the cards failed.");
  });
});

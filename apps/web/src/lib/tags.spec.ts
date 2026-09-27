import { afterEach, describe, expect, it, vi } from "vitest";
import { listTags } from "./tags";

const { headersMock } = vi.hoisted(() => ({ headersMock: vi.fn() }));

vi.mock("next/headers", () => ({ headers: headersMock }));

const userTags = [
  { id: 7, name: "biology" },
  { id: 8, name: "exam prep" },
];

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("listTags", () => {
  it("returns an empty list without a cookie and never calls the API", async () => {
    headersMock.mockResolvedValue(new Headers());
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(listTags()).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("forwards the cookie to the API and returns the user's tags", async () => {
    headersMock.mockResolvedValue(new Headers({ cookie: "session_token=abc" }));
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => userTags,
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(listTags()).resolves.toEqual(userTags);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/tags",
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

    await expect(listTags()).rejects.toThrow("Loading your tags failed.");
  });
});

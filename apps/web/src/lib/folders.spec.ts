import { afterEach, describe, expect, it, vi } from "vitest";
import { listFolders } from "./folders";

const { headersMock } = vi.hoisted(() => ({ headersMock: vi.fn() }));

vi.mock("next/headers", () => ({ headers: headersMock }));

const userFolders = [
  { id: 7, name: "University", setCount: 4 },
  { id: 8, name: "Exams", setCount: 0 },
];

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("listFolders", () => {
  it("returns an empty list without a cookie and never calls the API", async () => {
    headersMock.mockResolvedValue(new Headers());
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(listFolders()).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("forwards the cookie to the API and returns the folders with counts", async () => {
    headersMock.mockResolvedValue(new Headers({ cookie: "session_token=abc" }));
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => userFolders,
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(listFolders()).resolves.toEqual(userFolders);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/folders",
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

    await expect(listFolders()).rejects.toThrow("Loading your folders failed.");
  });
});

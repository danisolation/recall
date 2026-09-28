import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getProgressSummary,
  listDueCards,
  listSessionHistory,
} from "./progress";

const { headersMock } = vi.hoisted(() => ({ headersMock: vi.fn() }));

vi.mock("next/headers", () => ({ headers: headersMock }));

const summary = {
  totalReviews: 4,
  correctReviews: 2,
  dueCount: 2,
  currentStreak: 3,
  longestStreak: 9,
};

const paginatedDue = {
  items: [
    {
      cardId: 7,
      front: "Front B",
      setId: 42,
      setTitle: "Spanish verbs",
      nextReviewAt: "2026-09-24T12:10:00.000Z",
    },
  ],
  nextOffset: null,
};

const paginatedHistory = {
  items: [
    {
      id: 5,
      userId: 1,
      setId: 42,
      setTitle: "Spanish verbs",
      status: "ACTIVE",
      startedAt: "2026-09-26T12:00:00.000Z",
      finishedAt: null,
      createdAt: "2026-09-26T12:00:00.000Z",
      updatedAt: "2026-09-26T12:00:00.000Z",
    },
  ],
  nextOffset: null,
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("getProgressSummary", () => {
  it("returns a zeroed summary without a cookie and never calls the API", async () => {
    headersMock.mockResolvedValue(new Headers());
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(getProgressSummary()).resolves.toEqual({
      totalReviews: 0,
      correctReviews: 0,
      dueCount: 0,
      currentStreak: 0,
      longestStreak: 0,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("forwards the cookie to the API and returns the summary", async () => {
    headersMock.mockResolvedValue(new Headers({ cookie: "session_token=abc" }));
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => summary,
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(getProgressSummary()).resolves.toEqual(summary);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/progress",
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
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => null,
      }),
    );

    await expect(getProgressSummary()).rejects.toThrow(
      "Loading the progress summary failed.",
    );
  });
});

describe("listDueCards", () => {
  it("returns an empty page without a cookie and never calls the API", async () => {
    headersMock.mockResolvedValue(new Headers());
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(listDueCards()).resolves.toEqual({ items: [], nextOffset: null });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("forwards the cookie to the API and returns the paginated due cards", async () => {
    headersMock.mockResolvedValue(new Headers({ cookie: "session_token=abc" }));
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => paginatedDue,
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(listDueCards()).resolves.toEqual(paginatedDue);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/progress/due",
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
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => null,
      }),
    );

    await expect(listDueCards()).rejects.toThrow(
      "Loading the due cards failed.",
    );
  });
});

describe("listSessionHistory", () => {
  it("returns an empty page without a cookie and never calls the API", async () => {
    headersMock.mockResolvedValue(new Headers());
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(listSessionHistory()).resolves.toEqual({
      items: [],
      nextOffset: null,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("forwards the cookie to the API and returns the paginated history", async () => {
    headersMock.mockResolvedValue(new Headers({ cookie: "session_token=abc" }));
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => paginatedHistory,
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(listSessionHistory()).resolves.toEqual(paginatedHistory);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/study-sessions",
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
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => null,
      }),
    );

    await expect(listSessionHistory()).rejects.toThrow(
      "Loading the history failed.",
    );
  });
});

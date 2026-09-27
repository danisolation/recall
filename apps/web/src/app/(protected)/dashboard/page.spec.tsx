import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DashboardPage from "./page";

const { getCurrentUserMock, listSetsMock, listTagsMock, listFoldersMock } =
  vi.hoisted(() => ({
    getCurrentUserMock: vi.fn(),
    listSetsMock: vi.fn(),
    listTagsMock: vi.fn(),
    listFoldersMock: vi.fn(),
  }));

vi.mock("@/lib/session", () => ({
  getCurrentUser: getCurrentUserMock,
}));

vi.mock("@/lib/sets", () => ({
  listSets: listSetsMock,
}));

vi.mock("@/lib/tags", () => ({
  listTags: listTagsMock,
}));

vi.mock("@/lib/folders", () => ({
  listFolders: listFoldersMock,
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

beforeEach(() => {
  listTagsMock.mockResolvedValue([]);
  listFoldersMock.mockResolvedValue([]);
});

describe("DashboardPage", () => {
  it("redirects to the login screen without a session", async () => {
    getCurrentUserMock.mockResolvedValue(null);
    listSetsMock.mockResolvedValue({ items: [], nextOffset: null });

    await expect(DashboardPage({ searchParams: Promise.resolve({}) })).rejects.toThrow("NEXT_REDIRECT:/login");
  });

  it("renders the signed-in user's own account data", async () => {
    getCurrentUserMock.mockResolvedValue({
      id: 1,
      email: "user@example.com",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    listSetsMock.mockResolvedValue({ items: [], nextOffset: null });

    render(await DashboardPage({ searchParams: Promise.resolve({}) }));

    expect(
      screen.getByRole("heading", { name: "Dashboard" }),
    ).toBeInTheDocument();
    expect(screen.getByText("user@example.com")).toBeInTheDocument();
    expect(screen.getByText("January 1, 2026")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "New set" })).toHaveAttribute(
      "href",
      "/sets/new",
    );
  });

  it("renders the user's sets with links to their detail pages", async () => {
    getCurrentUserMock.mockResolvedValue({
      id: 1,
      email: "user@example.com",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    listSetsMock.mockResolvedValue({
      items: [
        {
          id: 42,
          ownerId: 1,
          title: "Spanish verbs",
          description: "Common irregular verbs",
          createdAt: "2026-02-01T00:00:00.000Z",
          updatedAt: "2026-02-01T00:00:00.000Z",
        },
      ],
      nextOffset: null,
    });

    render(await DashboardPage({ searchParams: Promise.resolve({}) }));

    expect(
      screen.getByRole("heading", { name: "Your sets" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Spanish verbs/ }),
    ).toHaveAttribute("href", "/sets/42");
  });

  it("offers creating a set when the user has none", async () => {
    getCurrentUserMock.mockResolvedValue({
      id: 1,
      email: "user@example.com",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    listSetsMock.mockResolvedValue({ items: [], nextOffset: null });

    render(await DashboardPage({ searchParams: Promise.resolve({}) }));

    expect(
      screen.getByRole("link", { name: "Create a set" }),
    ).toHaveAttribute("href", "/sets/new");
  });

  it("offers the View progress entry point", async () => {
    getCurrentUserMock.mockResolvedValue({
      id: 1,
      email: "user@example.com",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    listSetsMock.mockResolvedValue({ items: [], nextOffset: null });

    render(await DashboardPage({ searchParams: Promise.resolve({}) }));

    expect(
      screen.getByRole("link", { name: "View progress" }),
    ).toHaveAttribute("href", "/progress");
  });

  it("passes the query from the URL to the list request", async () => {
    getCurrentUserMock.mockResolvedValue({
      id: 1,
      email: "user@example.com",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    listSetsMock.mockResolvedValue({
      items: [
        {
          id: 42,
          ownerId: 1,
          title: "Biology basics",
          description: "Cells and organelles",
          createdAt: "2026-02-01T00:00:00.000Z",
          updatedAt: "2026-02-01T00:00:00.000Z",
        },
      ],
      nextOffset: null,
    });

    render(
      await DashboardPage({
        searchParams: Promise.resolve({ q: "biology" }),
      }),
    );

    expect(listSetsMock).toHaveBeenCalledWith("biology", undefined, undefined);
    expect(screen.getByLabelText("Search sets")).toHaveValue("biology");
    expect(
      screen.getByRole("link", { name: /Biology basics/ }),
    ).toHaveAttribute("href", "/sets/42");
  });

  it("shows a distinct no-matches state instead of the empty-library offer", async () => {
    getCurrentUserMock.mockResolvedValue({
      id: 1,
      email: "user@example.com",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    listSetsMock.mockResolvedValue({ items: [], nextOffset: null });

    render(
      await DashboardPage({
        searchParams: Promise.resolve({ q: "nothing-matches-this" }),
      }),
    );

    expect(
      screen.getByText(
        'No sets match "nothing-matches-this". Try a different search.',
      ),
    ).toBeInTheDocument();
    // The searching user refines the query; only a truly empty library
    // offers creating a set.
    expect(
      screen.queryByRole("link", { name: "Create a set" }),
    ).not.toBeInTheDocument();
  });

  it("renders the user's tags as filter links", async () => {
    getCurrentUserMock.mockResolvedValue({
      id: 1,
      email: "user@example.com",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    listTagsMock.mockResolvedValue([
      { id: 7, name: "biology" },
      { id: 8, name: "exam prep" },
    ]);
    listSetsMock.mockResolvedValue({ items: [], nextOffset: null });

    render(await DashboardPage({ searchParams: Promise.resolve({}) }));

    expect(
      screen.getByRole("link", { name: "biology" }),
    ).toHaveAttribute("href", "/dashboard?tag=7");
    expect(
      screen.getByRole("link", { name: "exam prep" }),
    ).toHaveAttribute("href", "/dashboard?tag=8");
    expect(
      screen.queryByRole("link", { name: "Clear filter" }),
    ).not.toBeInTheDocument();
  });

  it("composes the tag links with the active query", async () => {
    getCurrentUserMock.mockResolvedValue({
      id: 1,
      email: "user@example.com",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    listTagsMock.mockResolvedValue([{ id: 7, name: "biology" }]);
    listSetsMock.mockResolvedValue({ items: [], nextOffset: null });

    render(
      await DashboardPage({
        searchParams: Promise.resolve({ q: "cells" }),
      }),
    );

    expect(
      screen.getByRole("link", { name: "biology" }),
    ).toHaveAttribute("href", "/dashboard?q=cells&tag=7");
    expect(listSetsMock).toHaveBeenCalledWith("cells", undefined, undefined);
  });

  it("marks the active tag and offers clearing it", async () => {
    getCurrentUserMock.mockResolvedValue({
      id: 1,
      email: "user@example.com",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    listTagsMock.mockResolvedValue([
      { id: 7, name: "biology" },
      { id: 8, name: "exam prep" },
    ]);
    listSetsMock.mockResolvedValue({ items: [], nextOffset: null });

    render(
      await DashboardPage({ searchParams: Promise.resolve({ tag: "7" }) }),
    );

    expect(screen.getByRole("link", { name: "biology" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    expect(screen.getByRole("link", { name: "exam prep" })).not.toHaveAttribute(
      "aria-current",
    );
    expect(listSetsMock).toHaveBeenCalledWith(undefined, 7, undefined);
    expect(
      screen.getByRole("link", { name: "Clear filter" }),
    ).toHaveAttribute("href", "/dashboard");
  });

  it("keeps the query when clearing the tag filter", async () => {
    getCurrentUserMock.mockResolvedValue({
      id: 1,
      email: "user@example.com",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    listTagsMock.mockResolvedValue([{ id: 7, name: "biology" }]);
    listSetsMock.mockResolvedValue({ items: [], nextOffset: null });

    render(
      await DashboardPage({
        searchParams: Promise.resolve({ q: "cells", tag: "7" }),
      }),
    );

    expect(
      screen.getByRole("link", { name: "Clear filter" }),
    ).toHaveAttribute("href", "/dashboard?q=cells");
  });

  it("shows a distinct no-matches state for the tag filter", async () => {
    getCurrentUserMock.mockResolvedValue({
      id: 1,
      email: "user@example.com",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    listTagsMock.mockResolvedValue([{ id: 7, name: "biology" }]);
    listSetsMock.mockResolvedValue({ items: [], nextOffset: null });

    render(
      await DashboardPage({ searchParams: Promise.resolve({ tag: "7" }) }),
    );

    expect(
      screen.getByText(
        "No sets match the selected tag. Clear the filter to see all of your sets.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Create a set" }),
    ).not.toBeInTheDocument();
  });

  it("names both filters in the no-matches hint when they combine to nothing", async () => {
    getCurrentUserMock.mockResolvedValue({
      id: 1,
      email: "user@example.com",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    listTagsMock.mockResolvedValue([{ id: 7, name: "biology" }]);
    listSetsMock.mockResolvedValue({ items: [], nextOffset: null });

    render(
      await DashboardPage({
        searchParams: Promise.resolve({ q: "cells", tag: "7" }),
      }),
    );

    expect(
      screen.getByText(
        'No sets match "cells" with the selected tag. Clear the filter to see all of your sets.',
      ),
    ).toBeInTheDocument();
  });

  it("folds a malformed tag param into no filter", async () => {
    getCurrentUserMock.mockResolvedValue({
      id: 1,
      email: "user@example.com",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    listSetsMock.mockResolvedValue({ items: [], nextOffset: null });

    render(
      await DashboardPage({
        searchParams: Promise.resolve({ tag: "not-a-number" }),
      }),
    );

    expect(listSetsMock).toHaveBeenCalledWith(undefined, undefined, undefined);
    expect(
      screen.queryByRole("link", { name: "Clear filter" }),
    ).not.toBeInTheDocument();
    // No filters active: the empty library keeps its create offer.
    expect(
      screen.getByRole("link", { name: "Create a set" }),
    ).toBeInTheDocument();
  });

  it("still offers clearing an unknown tag id", async () => {
    getCurrentUserMock.mockResolvedValue({
      id: 1,
      email: "user@example.com",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    listTagsMock.mockResolvedValue([{ id: 7, name: "biology" }]);
    listSetsMock.mockResolvedValue({ items: [], nextOffset: null });

    render(
      await DashboardPage({ searchParams: Promise.resolve({ tag: "999" }) }),
    );

    // A foreign or stale tag id matches nothing (§41); the escape hatch
    // must survive so the URL state is never a dead end.
    expect(
      screen.getByText(
        "No sets match the selected tag. Clear the filter to see all of your sets.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Clear filter" }),
    ).toHaveAttribute("href", "/dashboard");
  });

  it("renders the user's folders as filter links with counts", async () => {
    getCurrentUserMock.mockResolvedValue({
      id: 1,
      email: "user@example.com",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    listFoldersMock.mockResolvedValue([
      { id: 7, name: "University", setCount: 4 },
      { id: 8, name: "Exams", setCount: 0 },
    ]);
    listSetsMock.mockResolvedValue({ items: [], nextOffset: null });

    render(await DashboardPage({ searchParams: Promise.resolve({}) }));

    expect(
      screen.getByRole("link", { name: "University · 4" }),
    ).toHaveAttribute("href", "/dashboard?folder=7");
    expect(
      screen.getByRole("link", { name: "Exams · 0" }),
    ).toHaveAttribute("href", "/dashboard?folder=8");
  });

  it("composes the folder links with the query and the tag", async () => {
    getCurrentUserMock.mockResolvedValue({
      id: 1,
      email: "user@example.com",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    listFoldersMock.mockResolvedValue([{ id: 8, name: "University", setCount: 2 }]);
    listTagsMock.mockResolvedValue([{ id: 7, name: "biology" }]);
    listSetsMock.mockResolvedValue({ items: [], nextOffset: null });

    render(
      await DashboardPage({
        searchParams: Promise.resolve({ q: "cells", tag: "7", folder: "8" }),
      }),
    );

    // Every link preserves the other axes and overrides its own (§23): the
    // active folder chip toggles itself off, the tag chip keeps the folder.
    expect(
      screen.getByRole("link", { name: "University · 2" }),
    ).toHaveAttribute("aria-current", "true");
    expect(
      screen.getByRole("link", { name: "University · 2" }),
    ).toHaveAttribute("href", "/dashboard?q=cells&tag=7");
    expect(
      screen.getByRole("link", { name: "biology" }),
    ).toHaveAttribute("href", "/dashboard?q=cells&tag=7&folder=8");
    expect(listSetsMock).toHaveBeenCalledWith("cells", 7, 8);
  });

  it("marks the active folder and toggles it off", async () => {
    getCurrentUserMock.mockResolvedValue({
      id: 1,
      email: "user@example.com",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    listFoldersMock.mockResolvedValue([
      { id: 7, name: "University", setCount: 4 },
      { id: 8, name: "Exams", setCount: 2 },
    ]);
    listSetsMock.mockResolvedValue({ items: [], nextOffset: null });

    render(
      await DashboardPage({ searchParams: Promise.resolve({ folder: "7" }) }),
    );

    expect(
      screen.getByRole("link", { name: "University · 4" }),
    ).toHaveAttribute("aria-current", "true");
    // The active chip toggles itself off; the sibling keeps its filter.
    expect(
      screen.getByRole("link", { name: "University · 4" }),
    ).toHaveAttribute("href", "/dashboard");
    expect(
      screen.getByRole("link", { name: "Exams · 2" }),
    ).toHaveAttribute("href", "/dashboard?folder=8");
    expect(listSetsMock).toHaveBeenCalledWith(undefined, undefined, 7);
  });

  it("shows a distinct no-matches state for the folder filter", async () => {
    getCurrentUserMock.mockResolvedValue({
      id: 1,
      email: "user@example.com",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    listFoldersMock.mockResolvedValue([{ id: 7, name: "University", setCount: 2 }]);
    listSetsMock.mockResolvedValue({ items: [], nextOffset: null });

    render(
      await DashboardPage({ searchParams: Promise.resolve({ folder: "7" }) }),
    );

    expect(
      screen.getByText(
        "No sets match the selected folder. Clear the filter to see all of your sets.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Create a set" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Clear filter" }),
    ).toHaveAttribute("href", "/dashboard");
  });

  it("names all three filters in the no-matches hint", async () => {
    getCurrentUserMock.mockResolvedValue({
      id: 1,
      email: "user@example.com",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    listFoldersMock.mockResolvedValue([{ id: 7, name: "University", setCount: 2 }]);
    listTagsMock.mockResolvedValue([{ id: 7, name: "biology" }]);
    listSetsMock.mockResolvedValue({ items: [], nextOffset: null });

    render(
      await DashboardPage({
        searchParams: Promise.resolve({ q: "cells", tag: "7", folder: "7" }),
      }),
    );

    expect(
      screen.getByText(
        'No sets match "cells" with the selected tag with the selected folder. Clear the filter to see all of your sets.',
      ),
    ).toBeInTheDocument();
    // The clear link unwinds the tag first, then the folder.
    expect(
      screen.getByRole("link", { name: "Clear filter" }),
    ).toHaveAttribute("href", "/dashboard?q=cells&folder=7");
  });

  it("folds a malformed folder param into no filter", async () => {
    getCurrentUserMock.mockResolvedValue({
      id: 1,
      email: "user@example.com",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    listSetsMock.mockResolvedValue({ items: [], nextOffset: null });

    render(
      await DashboardPage({
        searchParams: Promise.resolve({ folder: "not-a-number" }),
      }),
    );

    expect(listSetsMock).toHaveBeenCalledWith(undefined, undefined, undefined);
    expect(
      screen.queryByRole("link", { name: "Clear filter" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Create a set" }),
    ).toBeInTheDocument();
  });

  it("still offers clearing an unknown folder id", async () => {
    getCurrentUserMock.mockResolvedValue({
      id: 1,
      email: "user@example.com",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    listFoldersMock.mockResolvedValue([{ id: 7, name: "University", setCount: 2 }]);
    listSetsMock.mockResolvedValue({ items: [], nextOffset: null });

    render(
      await DashboardPage({ searchParams: Promise.resolve({ folder: "999" }) }),
    );

    // A foreign or stale folder id matches nothing (§41); the escape hatch
    // must survive so the URL state is never a dead end.
    expect(
      screen.getByText(
        "No sets match the selected folder. Clear the filter to see all of your sets.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Clear filter" }),
    ).toHaveAttribute("href", "/dashboard");
  });
});

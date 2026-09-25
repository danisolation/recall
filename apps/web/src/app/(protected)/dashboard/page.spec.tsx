import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import DashboardPage from "./page";

const { getCurrentUserMock, listSetsMock } = vi.hoisted(() => ({
  getCurrentUserMock: vi.fn(),
  listSetsMock: vi.fn(),
}));

vi.mock("@/lib/session", () => ({
  getCurrentUser: getCurrentUserMock,
}));

vi.mock("@/lib/sets", () => ({
  listSets: listSetsMock,
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

describe("DashboardPage", () => {
  it("redirects to the login screen without a session", async () => {
    getCurrentUserMock.mockResolvedValue(null);
    listSetsMock.mockResolvedValue({ items: [], nextOffset: null });

    await expect(DashboardPage()).rejects.toThrow("NEXT_REDIRECT:/login");
  });

  it("renders the signed-in user's own account data", async () => {
    getCurrentUserMock.mockResolvedValue({
      id: 1,
      email: "user@example.com",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    listSetsMock.mockResolvedValue({ items: [], nextOffset: null });

    render(await DashboardPage());

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

    render(await DashboardPage());

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

    render(await DashboardPage());

    expect(
      screen.getByRole("link", { name: "Create a set" }),
    ).toHaveAttribute("href", "/sets/new");
  });
});

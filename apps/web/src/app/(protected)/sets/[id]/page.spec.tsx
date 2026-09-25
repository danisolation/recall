import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import SetDetailPage from "./page";

const { getSetMock, notFoundMock } = vi.hoisted(() => ({
  getSetMock: vi.fn(),
  notFoundMock: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("@/lib/sets", () => ({
  getSet: getSetMock,
}));

vi.mock("next/navigation", () => ({
  notFound: notFoundMock,
  useRouter: () => ({ push: vi.fn() }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const set = {
  id: 42,
  ownerId: 1,
  title: "Spanish verbs",
  description: "Common irregular verbs",
  createdAt: "2026-02-01T00:00:00.000Z",
  updatedAt: "2026-03-15T00:00:00.000Z",
};

describe("SetDetailPage", () => {
  it("renders the set's title, description, and timestamps", async () => {
    getSetMock.mockResolvedValue(set);

    render(await SetDetailPage({ params: Promise.resolve({ id: "42" }) }));

    expect(
      screen.getByRole("heading", { name: "Spanish verbs" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Edit set" }),
    ).toHaveAttribute("href", "/sets/42/edit");
    expect(screen.getByText("Common irregular verbs")).toBeInTheDocument();
    expect(screen.getByText("February 1, 2026")).toBeInTheDocument();
    expect(screen.getByText("March 15, 2026")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Delete set" }),
    ).toBeInTheDocument();
  });

  it("renders a 404 when the set is missing or not owned", async () => {
    getSetMock.mockResolvedValue(null);

    await expect(
      SetDetailPage({ params: Promise.resolve({ id: "42" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("renders a 404 for a malformed id without calling the API", async () => {
    await expect(
      SetDetailPage({ params: Promise.resolve({ id: "not-a-number" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(getSetMock).not.toHaveBeenCalled();
  });
});

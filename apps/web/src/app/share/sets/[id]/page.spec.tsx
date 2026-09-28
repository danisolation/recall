import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import PublicSetPage from "./page";
import type { PublicSet } from "@/lib/public";

const { fetchPublicSetMock, notFoundMock } = vi.hoisted(() => ({
  fetchPublicSetMock: vi.fn(),
  notFoundMock: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("@/lib/public", () => ({
  fetchPublicSet: fetchPublicSetMock,
}));

vi.mock("next/navigation", () => ({
  notFound: notFoundMock,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const set: PublicSet = {
  title: "Spanish verbs",
  description: "Common irregular verbs",
  tags: [
    { id: 7, name: "biology" },
    { id: 8, name: "exam prep" },
  ],
  cards: [
    { id: 1, front: "What is mitosis?", back: "Cell division" },
    { id: 2, front: "What is osmosis?", back: "Diffusion of water" },
  ],
};

describe("PublicSetPage", () => {
  it("renders the set's title, description, tags, and cards", async () => {
    fetchPublicSetMock.mockResolvedValue(set);

    render(
      await PublicSetPage({ params: Promise.resolve({ id: "42" }) }),
    );

    expect(
      screen.getByRole("heading", { name: "Spanish verbs" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Common irregular verbs")).toBeInTheDocument();
    expect(screen.getByText("Tags")).toBeInTheDocument();
    expect(screen.getByText("biology, exam prep")).toBeInTheDocument();
    expect(screen.getByText("What is mitosis?")).toBeInTheDocument();
    expect(screen.getByText("Cell division")).toBeInTheDocument();
    expect(screen.getByText("What is osmosis?")).toBeInTheDocument();
    expect(screen.getByText("Diffusion of water")).toBeInTheDocument();
  });

  it("renders no owner or action controls", async () => {
    fetchPublicSetMock.mockResolvedValue(set);

    render(
      await PublicSetPage({ params: Promise.resolve({ id: "42" }) }),
    );

    expect(screen.queryByRole("link", { name: "Edit set" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Study" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Delete set" })).toBeNull();
    expect(screen.queryByLabelText("Front")).toBeNull();
  });

  it("renders an empty state for a set without cards", async () => {
    fetchPublicSetMock.mockResolvedValue({ ...set, cards: [] });

    render(
      await PublicSetPage({ params: Promise.resolve({ id: "42" }) }),
    );

    expect(screen.getByText("This set has no cards yet.")).toBeInTheDocument();
  });

  it("renders a 404 when the set is missing or private", async () => {
    fetchPublicSetMock.mockResolvedValue(null);

    await expect(
      PublicSetPage({ params: Promise.resolve({ id: "42" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("renders a 404 for a malformed id without calling the API", async () => {
    await expect(
      PublicSetPage({ params: Promise.resolve({ id: "not-a-number" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(fetchPublicSetMock).not.toHaveBeenCalled();
  });

  it("renders the card list on the clay panel register", async () => {
    fetchPublicSetMock.mockResolvedValue(set);

    const { container } = render(
      await PublicSetPage({ params: Promise.resolve({ id: "42" }) }),
    );

    // The cards are static content on a read-only page, so no press
    // affordance — but they must still sit on the panel register, which is
    // what keeps a shared set looking like the same product as a private one.
    const items = container.querySelectorAll("li");
    expect(items).toHaveLength(2);
    for (const item of items) {
      expect(item).toHaveClass("rounded-card", "shadow-clay");
    }
  });

  it("keeps the shared page free of any interactive control", async () => {
    fetchPublicSetMock.mockResolvedValue(set);

    render(await PublicSetPage({ params: Promise.resolve({ id: "42" }) }));

    // ADR-015: read-only outside the protected group. The restyle must not
    // introduce a press state, hover cue, or focusable affordance here that
    // would imply the visitor can act on the set.
    expect(screen.queryAllByRole("button")).toHaveLength(0);
    expect(screen.queryAllByRole("link")).toHaveLength(0);
    expect(screen.queryAllByRole("textbox")).toHaveLength(0);
  });
});

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CardList } from "./card-list";
import type { Card } from "@/lib/cards";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

const cards: Card[] = [
  {
    id: 1,
    setId: 42,
    front: "What is mitosis?",
    back: "Cell division",
    position: 1,
    createdAt: "2026-02-01T00:00:00.000Z",
    updatedAt: "2026-02-01T00:00:00.000Z",
  },
  {
    id: 2,
    setId: 42,
    front: "What is osmosis?",
    back: "Diffusion of water",
    position: 2,
    createdAt: "2026-02-01T00:00:00.000Z",
    updatedAt: "2026-02-01T00:00:00.000Z",
  },
];

afterEach(() => {
  cleanup();
});

describe("CardList", () => {
  it("renders the cards' fronts and backs in study order", () => {
    render(<CardList cards={cards} />);

    const items = screen.getAllByRole("listitem");

    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("What is mitosis?");
    expect(items[0]).toHaveTextContent("Cell division");
    expect(items[1]).toHaveTextContent("What is osmosis?");
    expect(items[1]).toHaveTextContent("Diffusion of water");
  });

  it("links each card to its edit state", () => {
    render(<CardList cards={cards} />);

    const editLinks = screen.getAllByRole("link", { name: "Edit" });

    expect(editLinks).toHaveLength(2);
    expect(editLinks[0]).toHaveAttribute("href", "?edit=1");
    expect(editLinks[1]).toHaveAttribute("href", "?edit=2");
  });

  it("offers a delete control for each card", () => {
    render(<CardList cards={cards} />);

    expect(screen.getAllByRole("button", { name: "Delete" })).toHaveLength(2);
  });

  it("offers adding the first card when there are none", () => {
    render(<CardList cards={[]} />);

    expect(
      screen.getByText("No cards yet. Add your first card to start studying."),
    ).toBeInTheDocument();
  });
});

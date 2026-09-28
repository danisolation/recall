import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SetList } from "./set-list";
import type { StudySet } from "@/lib/sets";

const sets: StudySet[] = [
  {
    id: 42,
    ownerId: 1,
    title: "Spanish verbs",
    description: "Common irregular verbs",
    visibility: "private",
    createdAt: "2026-02-01T00:00:00.000Z",
    updatedAt: "2026-02-01T00:00:00.000Z",
  },
  {
    id: 7,
    ownerId: 1,
    title: "World capitals",
    description: null,
    visibility: "private",
    createdAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-01-15T00:00:00.000Z",
  },
];

afterEach(() => {
  cleanup();
});

describe("SetList", () => {
  it("renders each set as a link to its detail page", () => {
    render(<SetList sets={sets} />);

    expect(
      screen.getByRole("link", { name: /Spanish verbs/ }),
    ).toHaveAttribute("href", "/sets/42");
    expect(
      screen.getByRole("link", { name: /World capitals/ }),
    ).toHaveAttribute("href", "/sets/7");
  });

  it("offers creating a set when there are none", () => {
    render(<SetList sets={[]} />);

    expect(
      screen.getByRole("link", { name: "Create a set" }),
    ).toHaveAttribute("href", "/sets/new");
  });

  it("renders each set tile as a raised surface with a press affordance", () => {
    render(<SetList sets={sets} />);

    const link = screen.getByRole("link", { name: /Spanish verbs/ });
    // The panel register is already there (REDESIGN-003); what the old tile
    // lacked was any *press* affordance, so a set link looked exactly like a
    // static card. ADR-018's soft-press is what makes it read as clickable.
    expect(link).toHaveClass(
      "rounded-card",
      "shadow-clay",
      "active:translate-y-0.5",
      "active:shadow-clay-pressed",
    );
    expect(link).toHaveClass("transition-[transform,box-shadow]");
  });

  it("leaves focus to the single base rule instead of repeating it per tile", () => {
    render(<SetList sets={sets} />);

    const link = screen.getByRole("link", { name: /Spanish verbs/ });
    // `outline-ink` was retired with the old palette in REDESIGN-003 — the
    // classes were already dead, resolving to nothing. Focus is now owned by
    // the one `:focus-visible` rule in globals.css.
    expect(link.className).not.toContain("focus-visible:outline");
  });

  it("keeps the empty state distinct from a no-matches filter", () => {
    render(<SetList sets={[]} />);

    // §56: the empty library offers a way forward. This is a behavior the
    // restyle must preserve, not invent.
    expect(
      screen.getByText("Create your first study set to start learning."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Create a set" }),
    ).toBeInTheDocument();
  });
});

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
    createdAt: "2026-02-01T00:00:00.000Z",
    updatedAt: "2026-02-01T00:00:00.000Z",
  },
  {
    id: 7,
    ownerId: 1,
    title: "World capitals",
    description: null,
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
});

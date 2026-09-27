import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Skeleton } from "./skeleton";

afterEach(() => {
  cleanup();
});

describe("Skeleton", () => {
  it("renders a decorative pulse block", () => {
    render(<Skeleton data-testid="skeleton" />);

    const skeleton = screen.getByTestId("skeleton");
    expect(skeleton).toHaveClass("animate-pulse", "bg-ink/10");
    expect(skeleton).toHaveAttribute("aria-hidden", "true");
  });

  it("merges extra classes after the base", () => {
    render(<Skeleton className="h-36 w-full" data-testid="skeleton" />);

    expect(screen.getByTestId("skeleton")).toHaveClass("h-36", "w-full");
  });
});

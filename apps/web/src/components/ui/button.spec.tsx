import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Button } from "./button";

afterEach(() => {
  cleanup();
});

describe("Button", () => {
  it("gives the primary variant an explicit light text color", () => {
    render(<Button>Save</Button>);

    // ADR-018 contrast fix: the primary background is `marker` #7C3AED
    // (5.70:1 against white), but the button is the one surface where
    // `marker-deep` can appear on hover, and white on marker-deep is only
    // 3.77:1 — so the text token is pinned rather than inherited.
    expect(screen.getByRole("button", { name: "Save" })).toHaveClass(
      "text-white",
    );
  });

  it("keeps the clay radius, double shadow, and 44px touch target", () => {
    render(<Button>Save</Button>);

    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toHaveClass("min-h-11", "rounded-xl", "shadow-clay");
  });

  it("marks itself disabled and non-interactive", () => {
    render(<Button disabled>Save</Button>);

    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toBeDisabled();
    expect(button).toHaveClass("disabled:pointer-events-none");
  });

  it("renders the secondary variant on the card surface", () => {
    render(<Button variant="secondary">Cancel</Button>);

    const button = screen.getByRole("button", { name: "Cancel" });
    expect(button).toHaveClass("bg-card");
    // The secondary surface is light, so it must not inherit the primary's
    // white text.
    expect(button).not.toHaveClass("text-white");
  });

  it("defaults to type=button so it never submits a form by accident", () => {
    render(<Button>Save</Button>);

    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute(
      "type",
      "button",
    );
  });
});

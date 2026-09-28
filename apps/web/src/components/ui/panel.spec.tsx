import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Panel, panelClassName } from "./panel";

afterEach(() => {
  cleanup();
});

describe("Panel", () => {
  it("renders a section with the panel register classes", () => {
    render(<Panel data-testid="panel">Content</Panel>);

    const panel = screen.getByTestId("panel");
    expect(panel.tagName).toBe("SECTION");
    expect(panel).toHaveClass("rounded-card", "bg-card", "sm:p-6");
    expect(panel).toHaveTextContent("Content");
  });

  it("appends extra classes after the register", () => {
    render(<Panel className="flex flex-col gap-4" data-testid="panel" />);

    expect(screen.getByTestId("panel")).toHaveClass(
      "rounded-card",
      "flex",
      "flex-col",
      "gap-4",
    );
  });

  it("exports the register string for non-section elements", () => {
    expect(panelClassName).toContain("rounded-card");
    // ADR-018: the hard 4px offset shadow is retired in favor of the clay
    // double shadow, which is what makes the surface read as molded.
    expect(panelClassName).toContain("shadow-clay");
    expect(panelClassName).not.toContain("shadow-[4px_4px_0_0]");
  });
});

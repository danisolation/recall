import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { TextLink, buttonLinkClassName, linkClassName } from "./text-link";

afterEach(() => {
  cleanup();
});

describe("TextLink", () => {
  it("renders a link with the link register classes", () => {
    render(<TextLink href="/sets/new">New set</TextLink>);

    const link = screen.getByRole("link", { name: "New set" });
    expect(link).toHaveAttribute("href", "/sets/new");
    expect(link).toHaveClass("rounded-sm", "underline", "hover:text-ink");
  });

  it("appends extra classes after the register", () => {
    render(
      <TextLink href="/sets/new" className="mt-3 inline-block">
        New set
      </TextLink>,
    );

    expect(screen.getByRole("link", { name: "New set" })).toHaveClass(
      "mt-3",
      "inline-block",
    );
  });

  it("exports the register string for link-styled buttons", () => {
    expect(linkClassName).toContain("rounded-sm");
    expect(linkClassName).toContain("focus-visible:outline-2");
  });

  it("renders the button variant with button weight but link semantics", () => {
    render(
      <TextLink href="/sets/new" variant="button">
        New set
      </TextLink>,
    );

    const link = screen.getByRole("link", { name: "New set" });
    expect(link).toHaveAttribute("href", "/sets/new");
    expect(link).toHaveClass("min-h-11", "rounded-md", "bg-card");
    expect(link).not.toHaveClass("underline");
  });

  it("exports the button register string", () => {
    expect(buttonLinkClassName).toContain("min-h-11");
    expect(buttonLinkClassName).toContain("gap-2");
  });
});

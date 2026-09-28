import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SearchInput } from "./search-input";

afterEach(() => {
  cleanup();
});

describe("SearchInput", () => {
  it("renders a labeled search input with a Search button", () => {
    render(<SearchInput />);

    expect(
      screen.getByLabelText("Search sets"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Search" }),
    ).toBeInTheDocument();
  });

  it("keeps the current query in the input", () => {
    render(<SearchInput initialQuery="biology" />);

    expect(screen.getByLabelText("Search sets")).toHaveValue("biology");
  });

  it("submits as a GET form to /dashboard with the q field", () => {
    render(<SearchInput initialQuery="biology" />);

    const input = screen.getByLabelText("Search sets");
    expect(input).toHaveAttribute("name", "q");
    expect(input).toHaveAttribute("type", "search");

    const form = (input as HTMLInputElement).form;
    expect(form).toHaveAttribute("action", "/dashboard");
    expect(form).toHaveAttribute("method", "get");
  });

  it("carries the active tag filter as a hidden field", () => {
    render(<SearchInput tagId={7} />);

    const form = (screen.getByLabelText("Search sets") as HTMLInputElement)
      .form;
    expect(form?.querySelector('input[type="hidden"][name="tag"]')).toHaveValue(
      "7",
    );
  });

  it("omits the hidden tag field without an active filter", () => {
    render(<SearchInput />);

    const form = (screen.getByLabelText("Search sets") as HTMLInputElement)
      .form;
    expect(
      form?.querySelector('input[type="hidden"][name="tag"]'),
    ).not.toBeInTheDocument();
  });

  it("labels the field with the shared field-label register", () => {
    render(<SearchInput />);

    // ADR-018: the search field is a FormField like every other form on the
    // app, so it borrows the register instead of hand-rolling a bare
    // `text-ink-soft` label — that is what keeps the label in the register
    // when the tokens move again.
    const label = screen.getByText("Search sets");
    expect(label.tagName).toBe("LABEL");
    expect(label).toHaveClass("font-semibold", "text-ink");
    expect(label).not.toHaveClass("text-ink-soft");
  });

  it("highlights the label when the field group holds focus", () => {
    render(<SearchInput />);

    // The group-focus-within highlight is what replaces the old highlighter
    // wash, so the wrapper has to carry `group` and the label has to answer
    // to it — the affordance is a two-part contract, not just a color.
    const input = screen.getByLabelText("Search sets");
    expect(input.closest("div.group")).not.toBeNull();
    expect(screen.getByText("Search sets")).toHaveClass(
      "group-focus-within:text-marker",
    );
  });
});

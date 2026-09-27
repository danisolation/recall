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

  it("carries the active folder filter as a hidden field", () => {
    render(<SearchInput folderId={9} />);

    const form = (screen.getByLabelText("Search sets") as HTMLInputElement)
      .form;
    expect(
      form?.querySelector('input[type="hidden"][name="folder"]'),
    ).toHaveValue("9");
  });
});

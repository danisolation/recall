import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FieldError } from "./field-error";

describe("FieldError", () => {
  it("renders a message as a live alert", () => {
    render(<FieldError>Email is required</FieldError>);

    expect(screen.getByRole("alert")).toHaveTextContent("Email is required");
  });

  it("signals the error with an icon as well as color", () => {
    // ADR-018 / §57: red text alone is not an accessible signal, so the
    // destructive state carries an aria-hidden icon beside the message.
    const { container } = render(<FieldError>Email is required</FieldError>);

    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("renders nothing without a message", () => {
    const { container } = render(<FieldError />);

    expect(container).toBeEmptyDOMElement();
  });
});

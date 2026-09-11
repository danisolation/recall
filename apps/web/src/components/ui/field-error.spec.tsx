import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FieldError } from "./field-error";

describe("FieldError", () => {
  it("renders a message as a live alert", () => {
    render(<FieldError>Email is required</FieldError>);

    expect(screen.getByRole("alert")).toHaveTextContent("Email is required");
  });

  it("renders nothing without a message", () => {
    const { container } = render(<FieldError />);

    expect(container).toBeEmptyDOMElement();
  });
});

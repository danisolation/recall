import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CompletionView } from "./completion-view";

afterEach(() => {
  cleanup();
});

describe("CompletionView", () => {
  it("renders the reviewed count and accuracy for a completed session", () => {
    render(
      <CompletionView
        setId={42}
        status="COMPLETED"
        reviews={[{ correct: true }, { correct: true }, { correct: false }]}
        totalCards={3}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Session complete" }),
    ).toBeInTheDocument();
    expect(screen.getByText("3 of 3 answered")).toBeInTheDocument();
    // The accuracy numeral is a styled child, so the compound string is
    // matched through textContent rather than direct text nodes.
    expect(
      screen.getByText(
        (_, element) =>
          element?.textContent === "2 of 3 correct (67% accuracy)",
      ),
    ).toBeInTheDocument();
  });

  it("rounds accuracy to the nearest percent", () => {
    render(
      <CompletionView
        setId={42}
        status="COMPLETED"
        reviews={[{ correct: true }, { correct: false }, { correct: false }]}
        totalCards={3}
      />,
    );

    expect(
      screen.getByText(
        (_, element) =>
          element?.textContent === "1 of 3 correct (33% accuracy)",
      ),
    ).toBeInTheDocument();
  });

  it("reports an abandoned session with no answers honestly", () => {
    render(
      <CompletionView
        setId={42}
        status="ABANDONED"
        reviews={[]}
        totalCards={2}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Session abandoned" }),
    ).toBeInTheDocument();
    expect(screen.getByText("0 of 2 answered")).toBeInTheDocument();
    expect(
      screen.getByText("No answers were recorded in this session."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/correct/)).not.toBeInTheDocument();
  });

  it("offers the way back to the set and the dashboard", () => {
    render(
      <CompletionView
        setId={42}
        status="COMPLETED"
        reviews={[{ correct: true }]}
        totalCards={1}
      />,
    );

    expect(
      screen.getByRole("link", { name: "Back to the set" }),
    ).toHaveAttribute("href", "/sets/42");
    expect(
      screen.getByRole("link", { name: "Back to the dashboard" }),
    ).toHaveAttribute("href", "/dashboard");
  });
});

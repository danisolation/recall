import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { UserMenu } from "./user-menu";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("UserMenu", () => {
  it("shows the signed-in email and a logout control", () => {
    render(<UserMenu email="user@example.com" />);

    expect(screen.getByText("user@example.com")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Log out" }),
    ).toBeInTheDocument();
  });

  it("keeps the 'Signed in as' label the E2E journeys assert on", () => {
    render(<UserMenu email="user@example.com" />);

    // Five browser journeys gate on this exact string, and ADR-013 froze
    // accessible names. Restyling the row must not reword it.
    expect(screen.getByText("Signed in as")).toBeInTheDocument();
  });

  it("seats the account line on a raised surface", () => {
    render(<UserMenu email="user@example.com" />);

    // ADR-018: the header row used to be bare text floating between the
    // wordmark and the logout button, so the account had no visual weight of
    // its own. A clay chip gives it one without touching the copy.
    const label = screen.getByText("Signed in as");
    const chip = label.closest("p");
    expect(chip).toHaveClass("rounded-full", "border-[3px]", "bg-card");
  });

  it("pairs the account label with a decorative icon, never replacing it", () => {
    const { container } = render(<UserMenu email="user@example.com" />);

    // ADR-013, retained under ADR-018: the icon is a companion, not a
    // substitute. The label text above is what carries the meaning.
    const icon = container.querySelector("svg");
    expect(icon).not.toBeNull();
    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("Signed in as")).toBeInTheDocument();
  });
});

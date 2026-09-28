import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Home from "./page";

const { getCurrentUserMock } = vi.hoisted(() => ({
  getCurrentUserMock: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

vi.mock("@/lib/session", () => ({
  getCurrentUser: getCurrentUserMock,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: ReactNode;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe("Home", () => {
  it("shows the signed-in email and a logout control when a session exists", async () => {
    getCurrentUserMock.mockResolvedValue({
      id: 1,
      email: "user@example.com",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });

    render(await Home());

    expect(screen.getByText("user@example.com")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Log out" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Log in" }),
    ).not.toBeInTheDocument();
  });

  it("offers log in and create account when signed out", async () => {
    getCurrentUserMock.mockResolvedValue(null);

    render(await Home());

    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(
      screen.getByRole("link", { name: "Create account" }),
    ).toHaveAttribute("href", "/register");
    expect(
      screen.queryByRole("button", { name: "Log out" }),
    ).not.toBeInTheDocument();
  });

  it("renders the wordmark chip on the same radius as the header's", async () => {
    getCurrentUserMock.mockResolvedValue(null);

    render(await Home());

    // ADR-018: the wordmark appears in four places — this landing page, the
    // protected header, and the two auth pages. Restyling it in one file
    // while the others keep `rounded-sm` would make the product's own name
    // look like two different marks, so all four are held to this one test's
    // radius (and login/register are verified in REDESIGN-008b).
    const chip = screen.getByText("Recall");
    expect(chip).toHaveClass("rounded-md");
    expect(chip).not.toHaveClass("rounded-sm");
  });

  it("keeps the signed-out feature trio on the clay panel register", async () => {
    getCurrentUserMock.mockResolvedValue(null);

    const { container } = render(await Home());

    // The three feature panels are the only repeated surfaces on this page.
    const panels = container.querySelectorAll("section");
    for (const panel of panels) {
      expect(panel).toHaveClass("rounded-card", "shadow-clay");
    }
  });
});

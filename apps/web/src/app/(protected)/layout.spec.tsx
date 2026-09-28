import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ProtectedLayout from "./layout";

const { getCurrentUserMock } = vi.hoisted(() => ({
  getCurrentUserMock: vi.fn(),
}));

vi.mock("@/lib/session", () => ({
  getCurrentUser: getCurrentUserMock,
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
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

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const user = {
  id: 1,
  email: "user@example.com",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("ProtectedLayout", () => {
  it("redirects to the login screen without a session", async () => {
    getCurrentUserMock.mockResolvedValue(null);

    await expect(
      ProtectedLayout({ children: <p>Secret</p> }),
    ).rejects.toThrow("NEXT_REDIRECT:/login");
  });

  it("renders the shell and children for an authenticated user", async () => {
    getCurrentUserMock.mockResolvedValue(user);

    render(await ProtectedLayout({ children: <p>Secret</p> }));

    expect(screen.getByText("Secret")).toBeInTheDocument();
    expect(screen.getByText("user@example.com")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Log out" }),
    ).toBeInTheDocument();
  });

  it("offers a skip link as the first focusable element", async () => {
    getCurrentUserMock.mockResolvedValue(user);

    const { container } = render(
      await ProtectedLayout({ children: <p>Secret</p> }),
    );

    const skipLink = screen.getByRole("link", { name: "Skip to content" });
    expect(skipLink).toHaveAttribute("href", "#main-content");

    // The first focusable element in the DOM (WCAG 2.4.1 bypass).
    const focusable = container.querySelectorAll(
      "a[href], button, input, select, textarea",
    );
    expect(focusable[0]).toBe(skipLink);

    // The target is the main content region.
    expect(screen.getByText("Secret").closest("main")).toHaveAttribute(
      "id",
      "main-content",
    );
  });

  it("leaves the skip link's focus ring to the single base rule", async () => {
    getCurrentUserMock.mockResolvedValue(user);

    render(await ProtectedLayout({ children: <p>Secret</p> }));

    // The skip link is a WCAG 2.4.1 bypass — the one element a keyboard user
    // reaches first — and it carried `focus:outline-2 … outline-ink`, whose
    // token was retired in REDESIGN-003. Those classes resolved to nothing,
    // so the bypass link had no visible focus ring at all. The single
    // `:focus-visible` base rule in globals.css now owns it.
    const skipLink = screen.getByRole("link", { name: "Skip to content" });
    expect(skipLink.className).not.toContain("focus:outline");
    expect(skipLink.className).not.toContain("outline-ink");
  });

  it("leaves the wordmark's focus ring to the single base rule", async () => {
    getCurrentUserMock.mockResolvedValue(user);

    render(await ProtectedLayout({ children: <p>Secret</p> }));

    // Same dead `outline-ink` utilities, same missing ring. This is the last
    // pair of them in the app.
    const wordmark = screen.getByRole("link", { name: /DANISOLATION/ });
    expect(wordmark.className).not.toContain("focus-visible:outline");
  });

  it("still shows the skip link when focused, keeping the A11Y-001 bypass", async () => {
    getCurrentUserMock.mockResolvedValue(user);

    render(await ProtectedLayout({ children: <p>Secret</p> }));

    // Removing the outline utilities must not remove the reveal: the link is
    // still `sr-only` until focused, then absolutely positioned so it does
    // not shift the layout.
    const skipLink = screen.getByRole("link", { name: "Skip to content" });
    expect(skipLink).toHaveClass("sr-only");
    expect(skipLink).toHaveClass("focus:not-sr-only");
    expect(skipLink).toHaveClass("focus:absolute");
  });

  it("renders the wordmark chip on the clay radius", async () => {
    getCurrentUserMock.mockResolvedValue(user);

    render(await ProtectedLayout({ children: <p>Secret</p> }));

    // ADR-018: the chip was still `rounded-sm` (0.25rem) — the last ADR-008
    // radius in the tree. The control register is 0.75rem+ from here on.
    const chip = screen.getByText("Recall");
    expect(chip).toHaveClass("rounded-md");
    expect(chip).not.toHaveClass("rounded-sm");
  });
});

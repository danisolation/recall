import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LogoutButton } from "./logout-button";

const { logoutUserMock, replaceMock, refreshMock } = vi.hoisted(() => ({
  logoutUserMock: vi.fn(),
  replaceMock: vi.fn(),
  refreshMock: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  logoutUser: logoutUserMock,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, refresh: refreshMock }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("LogoutButton", () => {
  it("revokes the session and returns to the login screen", async () => {
    logoutUserMock.mockResolvedValue(undefined);
    render(<LogoutButton />);

    await userEvent.click(screen.getByRole("button", { name: "Log out" }));

    await waitFor(() => expect(logoutUserMock).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/login"));
    expect(refreshMock).toHaveBeenCalled();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("disables the control while the request is in flight", async () => {
    let resolveLogout!: () => void;
    logoutUserMock.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveLogout = resolve;
      }),
    );
    render(<LogoutButton />);

    await userEvent.click(screen.getByRole("button", { name: "Log out" }));

    expect(screen.getByRole("button", { name: "Logging out…" })).toBeDisabled();

    resolveLogout();
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/login"));
  });

  it("shows an error and stays put when logout fails", async () => {
    logoutUserMock.mockRejectedValue(new Error("network down"));
    render(<LogoutButton />);

    await userEvent.click(screen.getByRole("button", { name: "Log out" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Logging out failed. Try again.",
    );
    expect(replaceMock).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Log out" })).toBeEnabled();
  });
});

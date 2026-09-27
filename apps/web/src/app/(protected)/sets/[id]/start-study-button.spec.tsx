import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api";
import { StartStudyButton } from "./start-study-button";

const { startSessionMock, pushMock } = vi.hoisted(() => ({
  startSessionMock: vi.fn(),
  pushMock: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  ApiError: class ApiError extends Error {
    constructor(
      readonly code: string,
      message: string,
    ) {
      super(message);
    }
  },
  startSession: startSessionMock,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("StartStudyButton", () => {
  it("starts a session and navigates to its study screen", async () => {
    startSessionMock.mockResolvedValue({ id: 7 });
    render(<StartStudyButton setId={42} />);

    await userEvent.click(screen.getByRole("button", { name: "Study" }));

    expect(startSessionMock).toHaveBeenCalledWith({ setId: 42 });
    await vi.waitFor(() =>
      expect(pushMock).toHaveBeenCalledWith("/study/7"),
    );
  });

  it("shows the API error and stays put when starting fails", async () => {
    startSessionMock.mockRejectedValue(
      new ApiError("SET_NOT_FOUND", "This set no longer exists."),
    );
    render(<StartStudyButton setId={42} />);

    await userEvent.click(screen.getByRole("button", { name: "Study" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "This set no longer exists.",
    );
    expect(pushMock).not.toHaveBeenCalled();
    // The control recovers so the attempt can be retried.
    expect(screen.getByRole("button", { name: "Study" })).toBeEnabled();
  });

  it("shows a generic error for unexpected failures", async () => {
    startSessionMock.mockRejectedValue(
      new ApiError("UNKNOWN", "Starting the study session failed. Try again."),
    );
    render(<StartStudyButton setId={42} />);

    await userEvent.click(screen.getByRole("button", { name: "Study" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Starting the study session failed. Try again.",
    );
    expect(pushMock).not.toHaveBeenCalled();
  });
});

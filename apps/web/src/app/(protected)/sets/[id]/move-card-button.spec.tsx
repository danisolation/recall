import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api";
import { MoveCardButton } from "./move-card-button";

const { moveCardMock, refreshMock } = vi.hoisted(() => ({
  moveCardMock: vi.fn(),
  refreshMock: vi.fn(),
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
  moveCard: moveCardMock,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("MoveCardButton", () => {
  it("renders its direction and is enabled by default", () => {
    render(
      <MoveCardButton
        setId={42}
        cardId={7}
        targetPosition={2}
        direction="up"
      />,
    );

    const button = screen.getByRole("button", { name: "Move up" });

    expect(button).toBeEnabled();
  });

  it("does not call the API when disabled", async () => {
    render(
      <MoveCardButton
        setId={42}
        cardId={7}
        targetPosition={2}
        direction="up"
        disabled
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Move up" }));

    expect(moveCardMock).not.toHaveBeenCalled();
    expect(refreshMock).not.toHaveBeenCalled();
  });

  it("moves the card to the target position and refreshes the list", async () => {
    moveCardMock.mockResolvedValue(undefined);
    render(
      <MoveCardButton
        setId={42}
        cardId={7}
        targetPosition={2}
        direction="up"
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Move up" }));

    expect(moveCardMock).toHaveBeenCalledWith(42, 7, 2);
    await vi.waitFor(() => expect(refreshMock).toHaveBeenCalled());
    expect(screen.queryAllByRole("alert")).toHaveLength(0);
  });

  it("refreshes when the card is already gone", async () => {
    moveCardMock.mockRejectedValue(
      new ApiError("CARD_NOT_FOUND", "This card no longer exists."),
    );
    render(
      <MoveCardButton
        setId={42}
        cardId={7}
        targetPosition={2}
        direction="up"
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Move up" }));

    await vi.waitFor(() => expect(refreshMock).toHaveBeenCalled());
    expect(screen.queryAllByRole("alert")).toHaveLength(0);
  });

  it("shows an error when the move fails for another reason", async () => {
    moveCardMock.mockRejectedValue(
      new ApiError("UNKNOWN", "Moving the card failed. Try again."),
    );
    render(
      <MoveCardButton
        setId={42}
        cardId={7}
        targetPosition={2}
        direction="up"
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Move up" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Moving the card failed. Try again.",
    );
    expect(refreshMock).not.toHaveBeenCalled();
  });
});

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api";
import { DeleteCardButton } from "./delete-card-button";

const { deleteCardMock, refreshMock } = vi.hoisted(() => ({
  deleteCardMock: vi.fn(),
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
  deleteCard: deleteCardMock,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

async function confirmDelete() {
  await userEvent.click(screen.getByRole("button", { name: "Delete" }));
  await userEvent.click(
    screen.getByRole("button", { name: "Confirm delete" }),
  );
}

describe("DeleteCardButton", () => {
  it("asks for confirmation before deleting", async () => {
    render(<DeleteCardButton setId={42} cardId={7} />);

    await userEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(
      screen.getByText("Delete this card? This cannot be undone."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Confirm delete" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(deleteCardMock).not.toHaveBeenCalled();
  });

  it("returns to a single control when cancelled", async () => {
    render(<DeleteCardButton setId={42} cardId={7} />);

    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(
      screen.queryByRole("button", { name: "Confirm delete" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Delete" }),
    ).toBeInTheDocument();
    expect(deleteCardMock).not.toHaveBeenCalled();
  });

  it("deletes the card and refreshes the list", async () => {
    deleteCardMock.mockResolvedValue(undefined);
    render(<DeleteCardButton setId={42} cardId={7} />);

    await confirmDelete();

    expect(deleteCardMock).toHaveBeenCalledWith(42, 7);
    await vi.waitFor(() => expect(refreshMock).toHaveBeenCalled());
    expect(screen.queryAllByRole("alert")).toHaveLength(0);
  });

  it("refreshes when the card is already gone", async () => {
    deleteCardMock.mockRejectedValue(
      new ApiError("CARD_NOT_FOUND", "This card no longer exists."),
    );
    render(<DeleteCardButton setId={42} cardId={7} />);

    await confirmDelete();

    await vi.waitFor(() => expect(refreshMock).toHaveBeenCalled());
    expect(screen.queryAllByRole("alert")).toHaveLength(0);
  });

  it("shows an error when the deletion fails for another reason", async () => {
    deleteCardMock.mockRejectedValue(
      new ApiError("UNKNOWN", "Deleting the card failed. Try again."),
    );
    render(<DeleteCardButton setId={42} cardId={7} />);

    await confirmDelete();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Deleting the card failed. Try again.",
    );
    expect(refreshMock).not.toHaveBeenCalled();
  });
});

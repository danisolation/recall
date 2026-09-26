import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api";
import type { Card } from "@/lib/cards";
import { EditCardForm } from "./edit-card-form";

const { pushMock, updateCardMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  updateCardMock: vi.fn(),
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
  updateCard: updateCardMock,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const card: Card = {
  id: 7,
  setId: 42,
  front: "What is mitosis?",
  back: "Cell division",
  position: 1,
  createdAt: "2026-02-01T00:00:00.000Z",
  updatedAt: "2026-02-01T00:00:00.000Z",
};

describe("EditCardForm", () => {
  it("renders the card's values prefilled with save and cancel controls", () => {
    render(<EditCardForm setId={42} card={card} />);

    expect(screen.getByLabelText("Front")).toHaveValue("What is mitosis?");
    expect(screen.getByLabelText("Back")).toHaveValue("Cell division");
    expect(
      screen.getByRole("button", { name: "Save changes" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Cancel" }),
    ).toBeInTheDocument();
  });

  it("blocks an empty front without calling the API", async () => {
    render(<EditCardForm setId={42} card={card} />);

    await userEvent.clear(screen.getByLabelText("Front"));
    await userEvent.click(
      screen.getByRole("button", { name: "Save changes" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Enter the front",
    );
    expect(updateCardMock).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("saves the update and navigates back to the set page", async () => {
    updateCardMock.mockResolvedValue(undefined);
    render(<EditCardForm setId={42} card={card} />);

    await userEvent.clear(screen.getByLabelText("Front"));
    await userEvent.type(screen.getByLabelText("Front"), "What is osmosis?");
    await userEvent.click(
      screen.getByRole("button", { name: "Save changes" }),
    );

    await waitFor(() =>
      expect(updateCardMock).toHaveBeenCalledWith(42, 7, {
        front: "What is osmosis?",
        back: "Cell division",
      }),
    );
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/sets/42"));
    expect(screen.queryAllByRole("alert")).toHaveLength(0);
  });

  it("shows an API error and keeps the values", async () => {
    updateCardMock.mockRejectedValue(
      new ApiError("UNKNOWN", "Saving your changes failed. Try again."),
    );
    render(<EditCardForm setId={42} card={card} />);

    await userEvent.click(
      screen.getByRole("button", { name: "Save changes" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Saving your changes failed. Try again.",
    );
    expect(pushMock).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Front")).toHaveValue("What is mitosis?");
  });

  it("cancels back to the set page without calling the API", async () => {
    render(<EditCardForm setId={42} card={card} />);

    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(pushMock).toHaveBeenCalledWith("/sets/42");
    expect(updateCardMock).not.toHaveBeenCalled();
  });
});

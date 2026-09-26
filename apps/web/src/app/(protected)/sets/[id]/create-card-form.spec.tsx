import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api";
import { CreateCardForm } from "./create-card-form";

const { createCardMock, refreshMock } = vi.hoisted(() => ({
  createCardMock: vi.fn(),
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
  createCard: createCardMock,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("CreateCardForm", () => {
  it("renders front and back fields with a submit button", () => {
    render(<CreateCardForm setId={42} />);

    expect(screen.getByLabelText("Front")).toBeInTheDocument();
    expect(screen.getByLabelText("Back")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add card" }),
    ).toBeInTheDocument();
  });

  it("shows an error and does not submit an empty form", async () => {
    render(<CreateCardForm setId={42} />);

    await userEvent.click(screen.getByRole("button", { name: "Add card" }));

    const alerts = await screen.findAllByRole("alert");
    expect(alerts.map((alert) => alert.textContent)).toEqual([
      "Enter the front",
      "Enter the back",
    ]);
    expect(createCardMock).not.toHaveBeenCalled();
    expect(refreshMock).not.toHaveBeenCalled();
  });

  it("adds the card, clears the fields, and refreshes the list", async () => {
    createCardMock.mockResolvedValue(undefined);
    render(<CreateCardForm setId={42} />);

    const front = screen.getByLabelText("Front");
    const back = screen.getByLabelText("Back");
    await userEvent.type(front, "What is mitosis?");
    await userEvent.type(back, "Cell division");
    await userEvent.click(screen.getByRole("button", { name: "Add card" }));

    await waitFor(() =>
      expect(createCardMock).toHaveBeenCalledWith(42, {
        front: "What is mitosis?",
        back: "Cell division",
      }),
    );
    await waitFor(() => expect(refreshMock).toHaveBeenCalled());
    expect(front).toHaveValue("");
    expect(back).toHaveValue("");
    expect(screen.queryAllByRole("alert")).toHaveLength(0);
  });

  it("shows a form error and keeps the values when the API call fails", async () => {
    createCardMock.mockRejectedValue(
      new ApiError("UNKNOWN", "Adding the card failed. Try again."),
    );
    render(<CreateCardForm setId={42} />);

    await userEvent.type(screen.getByLabelText("Front"), "Front");
    await userEvent.type(screen.getByLabelText("Back"), "Back");
    await userEvent.click(screen.getByRole("button", { name: "Add card" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Adding the card failed. Try again.",
    );
    expect(refreshMock).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Front")).toHaveValue("Front");
  });
});

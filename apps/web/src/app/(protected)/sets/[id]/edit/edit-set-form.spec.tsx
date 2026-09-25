import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api";
import { EditSetForm } from "./edit-set-form";

const { updateSetMock, pushMock } = vi.hoisted(() => ({
  updateSetMock: vi.fn(),
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
  updateSet: updateSetMock,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const set = {
  id: 42,
  ownerId: 1,
  title: "Spanish verbs",
  description: "Common irregular verbs",
  createdAt: "2026-02-01T00:00:00.000Z",
  updatedAt: "2026-03-15T00:00:00.000Z",
};

describe("EditSetForm", () => {
  it("renders prefilled with the set's current values", () => {
    render(<EditSetForm set={set} />);

    expect(screen.getByLabelText("Title")).toHaveValue("Spanish verbs");
    expect(screen.getByLabelText("Description")).toHaveValue(
      "Common irregular verbs",
    );
    expect(
      screen.getByRole("button", { name: "Save changes" }),
    ).toBeInTheDocument();
  });

  it("submits the update and returns to the detail page", async () => {
    render(<EditSetForm set={set} />);

    await userEvent.clear(screen.getByLabelText("Title"));
    await userEvent.type(screen.getByLabelText("Title"), "Spanish verbs 2");
    await userEvent.click(
      screen.getByRole("button", { name: "Save changes" }),
    );

    await waitFor(() =>
      expect(updateSetMock).toHaveBeenCalledWith(42, {
        title: "Spanish verbs 2",
        description: "Common irregular verbs",
      }),
    );
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/sets/42"));
    expect(screen.queryAllByRole("alert")).toHaveLength(0);
  });

  it("shows an error and does not submit an empty title", async () => {
    render(<EditSetForm set={set} />);

    await userEvent.clear(screen.getByLabelText("Title"));
    await userEvent.click(
      screen.getByRole("button", { name: "Save changes" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Enter a title",
    );
    expect(updateSetMock).not.toHaveBeenCalled();
  });

  it("shows a form error when the API call fails", async () => {
    updateSetMock.mockRejectedValue(
      new ApiError("SET_NOT_FOUND", "This set no longer exists."),
    );
    render(<EditSetForm set={set} />);

    await userEvent.click(
      screen.getByRole("button", { name: "Save changes" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "This set no longer exists.",
    );
    expect(pushMock).not.toHaveBeenCalled();
  });
});

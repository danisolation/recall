import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api";
import { CreateSetForm } from "./create-set-form";

const { createSetMock, pushMock } = vi.hoisted(() => ({
  createSetMock: vi.fn(),
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
  createSet: createSetMock,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("CreateSetForm", () => {
  it("renders title and description fields with a submit button", () => {
    render(<CreateSetForm />);

    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create set" }),
    ).toBeInTheDocument();
  });

  it("shows an error and does not submit an empty title", async () => {
    render(<CreateSetForm />);

    await userEvent.click(
      screen.getByRole("button", { name: "Create set" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Enter a title",
    );
    expect(createSetMock).not.toHaveBeenCalled();
  });

  it("creates the set and navigates to its detail page", async () => {
    createSetMock.mockResolvedValue({ id: 42 });
    render(<CreateSetForm />);

    await userEvent.type(screen.getByLabelText("Title"), "Biology basics");
    await userEvent.type(screen.getByLabelText("Description"), "Cells");
    await userEvent.click(
      screen.getByRole("button", { name: "Create set" }),
    );

    await waitFor(() =>
      expect(createSetMock).toHaveBeenCalledWith({
        title: "Biology basics",
        description: "Cells",
      }),
    );
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/sets/42"));
    expect(screen.queryAllByRole("alert")).toHaveLength(0);
  });

  it("shows a form error when the API call fails", async () => {
    createSetMock.mockRejectedValue(
      new ApiError("UNKNOWN", "Creating your set failed. Try again."),
    );
    render(<CreateSetForm />);

    await userEvent.type(screen.getByLabelText("Title"), "Biology basics");
    await userEvent.click(
      screen.getByRole("button", { name: "Create set" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Creating your set failed. Try again.",
    );
    expect(pushMock).not.toHaveBeenCalled();
  });
});

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api";
import { DeleteSetButton } from "./delete-set-button";

const { deleteSetMock, pushMock } = vi.hoisted(() => ({
  deleteSetMock: vi.fn(),
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
  deleteSet: deleteSetMock,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

async function confirmDelete() {
  await userEvent.click(screen.getByRole("button", { name: "Delete set" }));
  await userEvent.click(
    screen.getByRole("button", { name: "Confirm delete" }),
  );
}

describe("DeleteSetButton", () => {
  it("asks for confirmation before deleting", async () => {
    render(<DeleteSetButton setId={42} />);

    await userEvent.click(
      screen.getByRole("button", { name: "Delete set" }),
    );

    expect(
      screen.getByText("Delete this set? This cannot be undone."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Confirm delete" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(deleteSetMock).not.toHaveBeenCalled();
  });

  it("returns to a single control when cancelled", async () => {
    render(<DeleteSetButton setId={42} />);

    await userEvent.click(
      screen.getByRole("button", { name: "Delete set" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(
      screen.queryByRole("button", { name: "Confirm delete" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Delete set" }),
    ).toBeInTheDocument();
    expect(deleteSetMock).not.toHaveBeenCalled();
  });

  it("deletes the set and returns to the dashboard", async () => {
    deleteSetMock.mockResolvedValue(undefined);
    render(<DeleteSetButton setId={42} />);

    await confirmDelete();

    expect(deleteSetMock).toHaveBeenCalledWith(42);
    await vi.waitFor(() => expect(pushMock).toHaveBeenCalledWith("/dashboard"));
  });

  it("returns to the dashboard when the set is already gone", async () => {
    deleteSetMock.mockRejectedValue(
      new ApiError("SET_NOT_FOUND", "This set no longer exists."),
    );
    render(<DeleteSetButton setId={42} />);

    await confirmDelete();

    await vi.waitFor(() => expect(pushMock).toHaveBeenCalledWith("/dashboard"));
    expect(screen.queryAllByRole("alert")).toHaveLength(0);
  });

  it("shows an error when the deletion fails for another reason", async () => {
    deleteSetMock.mockRejectedValue(
      new ApiError("UNKNOWN", "Deleting your set failed. Try again."),
    );
    render(<DeleteSetButton setId={42} />);

    await confirmDelete();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Deleting your set failed. Try again.",
    );
    expect(pushMock).not.toHaveBeenCalled();
  });
});

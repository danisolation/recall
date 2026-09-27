import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api";
import { FoldersManager, type FolderRow } from "./folders-manager";

const { createFolderMock, deleteFolderMock, renameFolderMock, refreshMock } =
  vi.hoisted(() => ({
    createFolderMock: vi.fn(),
    deleteFolderMock: vi.fn(),
    renameFolderMock: vi.fn(),
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
  createFolder: createFolderMock,
  deleteFolder: deleteFolderMock,
  renameFolder: renameFolderMock,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const folders: FolderRow[] = [
  { id: 7, name: "University", setCount: 4 },
  { id: 8, name: "Exams", setCount: 0 },
];

describe("FoldersManager", () => {
  it("renders the create form and one row per folder with counts", () => {
    render(<FoldersManager folders={folders} />);

    expect(screen.getByLabelText("New folder")).toBeInTheDocument();
    expect(screen.getByText("University")).toBeInTheDocument();
    expect(screen.getByText("4 sets")).toBeInTheDocument();
    expect(screen.getByText("0 sets")).toBeInTheDocument();
  });

  it("offers an empty-library hint instead of rows", () => {
    render(<FoldersManager folders={[]} />);

    expect(
      screen.getByText("No folders yet. Create one to group your sets."),
    ).toBeInTheDocument();
    expect(screen.queryByText("University")).not.toBeInTheDocument();
  });

  it("creates a folder and refreshes the list", async () => {
    createFolderMock.mockResolvedValue({ id: 9, name: "Classes" });

    render(<FoldersManager folders={folders} />);

    await userEvent.type(screen.getByLabelText("New folder"), "Classes");
    await userEvent.click(
      screen.getByRole("button", { name: "Create folder" }),
    );

    await waitFor(() =>
      expect(createFolderMock).toHaveBeenCalledWith({ name: "Classes" }),
    );
    await waitFor(() => expect(refreshMock).toHaveBeenCalled());
    expect(screen.getByLabelText("New folder")).toHaveValue("");
  });

  it("shows a duplicate-name error and keeps the input", async () => {
    createFolderMock.mockRejectedValue(
      new ApiError("FOLDER_NAME_TAKEN", "A folder with this name already exists."),
    );

    render(<FoldersManager folders={folders} />);

    await userEvent.type(screen.getByLabelText("New folder"), "University");
    await userEvent.click(
      screen.getByRole("button", { name: "Create folder" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "A folder with this name already exists.",
    );
    expect(screen.getByLabelText("New folder")).toHaveValue("University");
    expect(refreshMock).not.toHaveBeenCalled();
  });

  it("blocks a blank folder name without calling the API", async () => {
    render(<FoldersManager folders={folders} />);

    await userEvent.type(screen.getByLabelText("New folder"), "   ");
    await userEvent.click(
      screen.getByRole("button", { name: "Create folder" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Enter a folder name",
    );
    expect(createFolderMock).not.toHaveBeenCalled();
  });

  it("renames a folder through the inline swap", async () => {
    renameFolderMock.mockResolvedValue(undefined);

    render(<FoldersManager folders={folders} />);

    await userEvent.click(
      screen.getAllByRole("button", { name: "Rename" })[0]!,
    );
    const input = screen.getByLabelText("Folder name");
    expect(input).toHaveValue("University");

    await userEvent.clear(input);
    await userEvent.type(input, "Classes");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(renameFolderMock).toHaveBeenCalledWith(7, { name: "Classes" }),
    );
    await waitFor(() => expect(refreshMock).toHaveBeenCalled());
  });

  it("confirms a delete with the unfilesSets copy and refreshes", async () => {
    deleteFolderMock.mockResolvedValue(undefined);

    render(<FoldersManager folders={folders} />);

    await userEvent.click(
      screen.getAllByRole("button", { name: "Delete" })[0]!,
    );

    expect(
      screen.getByText(
        "Delete this folder? Its sets stay in your library, unfiled.",
      ),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: "Confirm delete" }),
    );

    await waitFor(() => expect(deleteFolderMock).toHaveBeenCalledWith(7));
    await waitFor(() => expect(refreshMock).toHaveBeenCalled());
  });

  it("treats an already-deleted folder as success and refreshes", async () => {
    deleteFolderMock.mockRejectedValue(
      new ApiError("FOLDER_NOT_FOUND", "This folder no longer exists."),
    );

    render(<FoldersManager folders={folders} />);

    await userEvent.click(
      screen.getAllByRole("button", { name: "Delete" })[0]!,
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Confirm delete" }),
    );

    await waitFor(() => expect(refreshMock).toHaveBeenCalled());
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

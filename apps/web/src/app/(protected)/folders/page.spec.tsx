import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import FoldersPage from "./page";

const { listFoldersMock } = vi.hoisted(() => ({
  listFoldersMock: vi.fn(),
}));

vi.mock("@/lib/folders", () => ({
  listFolders: listFoldersMock,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("FoldersPage", () => {
  it("renders the heading and hands the folders to the manager", async () => {
    listFoldersMock.mockResolvedValue([
      { id: 7, name: "University", setCount: 4 },
    ]);

    render(await FoldersPage());

    expect(
      screen.getByRole("heading", { name: "Folders" }),
    ).toBeInTheDocument();
    expect(screen.getByText("University")).toBeInTheDocument();
    expect(screen.getByText("4 sets")).toBeInTheDocument();
  });

  it("renders the empty-library hint for a user without folders", async () => {
    listFoldersMock.mockResolvedValue([]);

    render(await FoldersPage());

    expect(
      screen.getByText("No folders yet. Create one to group your sets."),
    ).toBeInTheDocument();
  });
});

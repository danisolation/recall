import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api";
import type { StudySet } from "@/lib/sets";
import { EditSetForm } from "./edit-set-form";

const { updateSetMock, replaceTagsMock, pushMock } = vi.hoisted(() => ({
  updateSetMock: vi.fn(),
  replaceTagsMock: vi.fn(),
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
  replaceTags: replaceTagsMock,
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
  folderId: null,
  title: "Spanish verbs",
  description: "Common irregular verbs",
  visibility: "private",
  createdAt: "2026-02-01T00:00:00.000Z",
  updatedAt: "2026-03-15T00:00:00.000Z",
} satisfies StudySet;

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
        folderId: null,
        visibility: "private",
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

  it("prefills the tags field from the set's current tags", () => {
    render(<EditSetForm set={set} initialTags={["Biology", "exam prep"]} />);

    expect(screen.getByLabelText("Tags")).toHaveValue("Biology, exam prep");
  });

  it("saves the entered tags with the set", async () => {
    updateSetMock.mockResolvedValue(undefined);
    replaceTagsMock.mockResolvedValue(undefined);
    render(<EditSetForm set={set} initialTags={["Biology", "exam prep"]} />);

    await userEvent.clear(screen.getByLabelText("Tags"));
    await userEvent.type(screen.getByLabelText("Tags"), "Biology");
    await userEvent.click(
      screen.getByRole("button", { name: "Save changes" }),
    );

    await waitFor(() =>
      expect(replaceTagsMock).toHaveBeenCalledWith(42, {
        tags: ["Biology"],
      }),
    );
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/sets/42"));
    expect(updateSetMock).toHaveBeenCalledTimes(1);
  });

  it("shows an error and keeps the values when saving the tags fails", async () => {
    updateSetMock.mockResolvedValue(undefined);
    replaceTagsMock.mockRejectedValue(
      new ApiError("UNKNOWN", "Saving the tags failed. Try again."),
    );
    render(<EditSetForm set={set} initialTags={["Biology"]} />);

    await userEvent.click(
      screen.getByRole("button", { name: "Save changes" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Saving the tags failed. Try again.",
    );
    expect(pushMock).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Tags")).toHaveValue("Biology");
  });

  it("files the set into the selected folder", async () => {
    updateSetMock.mockResolvedValue(undefined);
    replaceTagsMock.mockResolvedValue(undefined);
    render(
      <EditSetForm
        set={{ ...set, folderId: null }}
        folders={[{ id: 9, name: "University" }]}
      />,
    );

    await userEvent.selectOptions(screen.getByLabelText("Folder"), "9");
    await userEvent.click(
      screen.getByRole("button", { name: "Save changes" }),
    );

    await waitFor(() =>
      expect(updateSetMock).toHaveBeenCalledWith(42, {
        title: "Spanish verbs",
        description: "Common irregular verbs",
        folderId: 9,
        visibility: "private",
      }),
    );
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/sets/42"));
  });

  it("prefills the Sharing select with the set's current visibility", () => {
    render(<EditSetForm set={set} />);

    expect(screen.getByLabelText("Sharing")).toHaveValue("private");
  });

  it("sends the selected visibility on every save", async () => {
    updateSetMock.mockResolvedValue(undefined);
    replaceTagsMock.mockResolvedValue(undefined);
    render(<EditSetForm set={set} />);

    await userEvent.selectOptions(screen.getByLabelText("Sharing"), "public");
    await userEvent.click(
      screen.getByRole("button", { name: "Save changes" }),
    );

    await waitFor(() =>
      expect(updateSetMock).toHaveBeenCalledWith(42, {
        title: "Spanish verbs",
        description: "Common irregular verbs",
        folderId: null,
        visibility: "public",
      }),
    );
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/sets/42"));
  });

  it("prefills the folder select with the set's current folder", () => {
    render(
      <EditSetForm
        set={{ ...set, folderId: 9 }}
        folders={[{ id: 9, name: "University" }]}
      />,
    );

    expect(screen.getByLabelText("Folder")).toHaveValue("9");
  });
});

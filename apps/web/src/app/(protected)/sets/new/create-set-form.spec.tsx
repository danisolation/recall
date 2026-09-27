import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api";
import { CreateSetForm } from "./create-set-form";

const { createSetMock, replaceTagsMock, pushMock } = vi.hoisted(() => ({
  createSetMock: vi.fn(),
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
  createSet: createSetMock,
  replaceTags: replaceTagsMock,
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
        folderId: null,
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

  it("creates the set, saves the entered tags, and navigates", async () => {
    createSetMock.mockResolvedValue({ id: 42 });
    replaceTagsMock.mockResolvedValue(undefined);
    render(<CreateSetForm />);

    await userEvent.type(screen.getByLabelText("Title"), "Biology basics");
    await userEvent.type(screen.getByLabelText("Tags"), "Biology, exam prep");
    await userEvent.click(
      screen.getByRole("button", { name: "Create set" }),
    );

    await waitFor(() =>
      expect(createSetMock).toHaveBeenCalledWith({
        title: "Biology basics",
        description: "",
        folderId: null,
      }),
    );
    await waitFor(() =>
      expect(replaceTagsMock).toHaveBeenCalledWith(42, {
        tags: ["Biology", "exam prep"],
      }),
    );
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/sets/42"));
  });

  it("blocks submission when a tag is invalid", async () => {
    render(<CreateSetForm />);

    await userEvent.type(screen.getByLabelText("Title"), "Biology basics");
    await userEvent.type(screen.getByLabelText("Tags"), "a".repeat(51));
    await userEvent.click(
      screen.getByRole("button", { name: "Create set" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Use 50 characters or fewer per tag",
    );
    expect(createSetMock).not.toHaveBeenCalled();
    expect(replaceTagsMock).not.toHaveBeenCalled();
  });

  it("retries only the tags when saving them fails after creation", async () => {
    createSetMock.mockResolvedValue({ id: 42 });
    replaceTagsMock
      .mockRejectedValueOnce(
        new ApiError("UNKNOWN", "Saving the tags failed. Try again."),
      )
      .mockResolvedValueOnce(undefined);
    render(<CreateSetForm />);

    await userEvent.type(screen.getByLabelText("Title"), "Biology basics");
    await userEvent.type(screen.getByLabelText("Tags"), "Biology");
    await userEvent.click(
      screen.getByRole("button", { name: "Create set" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Saving the tags failed. Try again.",
    );
    expect(pushMock).not.toHaveBeenCalled();

    // The set already exists; the retry must not create it again.
    await userEvent.click(
      screen.getByRole("button", { name: "Create set" }),
    );

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/sets/42"));
    expect(createSetMock).toHaveBeenCalledTimes(1);
    expect(replaceTagsMock).toHaveBeenCalledTimes(2);
  });

  it("files the new set into the selected folder", async () => {
    createSetMock.mockResolvedValue({ id: 42 });
    replaceTagsMock.mockResolvedValue(undefined);
    render(
      <CreateSetForm folders={[{ id: 9, name: "University" }]} />,
    );

    await userEvent.type(screen.getByLabelText("Title"), "Biology basics");
    await userEvent.selectOptions(screen.getByLabelText("Folder"), "9");
    await userEvent.click(
      screen.getByRole("button", { name: "Create set" }),
    );

    await waitFor(() =>
      expect(createSetMock).toHaveBeenCalledWith({
        title: "Biology basics",
        description: "",
        folderId: 9,
      }),
    );
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/sets/42"));
  });
});

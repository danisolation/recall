import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api";
import { StudyClient } from "./study-client";

const { getSessionMock, recordReviewMock } = vi.hoisted(() => ({
  getSessionMock: vi.fn(),
  recordReviewMock: vi.fn(),
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
  getSession: getSessionMock,
  recordReview: recordReviewMock,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const sessionData = {
  session: { id: 5, setId: 42, status: "ACTIVE" },
  reviews: [],
  cards: [
    { id: 1, front: "What is mitosis?", back: "Cell division" },
    { id: 2, front: "What is osmosis?", back: "Diffusion of water" },
  ],
};

describe("StudyClient", () => {
  it("shows a loading state while the session loads", () => {
    getSessionMock.mockReturnValue(new Promise(() => {}));

    render(<StudyClient sessionId={5} />);

    expect(screen.getByText("Loading…")).toBeInTheDocument();
    expect(recordReviewMock).not.toHaveBeenCalled();
  });

  it("shows the current card's front and reveals the back", async () => {
    getSessionMock.mockResolvedValue(sessionData);

    render(<StudyClient sessionId={5} />);

    expect(await screen.findByText("What is mitosis?")).toBeInTheDocument();
    expect(screen.queryByText("Cell division")).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: "Reveal answer" }),
    );

    expect(screen.getByText("Cell division")).toBeInTheDocument();
  });

  it("records the review and advances to the next card", async () => {
    getSessionMock.mockResolvedValue(sessionData);
    recordReviewMock.mockResolvedValue({ id: 1, cardId: 1, correct: true });

    render(<StudyClient sessionId={5} />);

    await screen.findByText("What is mitosis?");
    await userEvent.click(
      screen.getByRole("button", { name: "Reveal answer" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Correct" }));

    expect(recordReviewMock).toHaveBeenCalledWith(5, {
      cardId: 1,
      correct: true,
    });
    expect(await screen.findByText("What is osmosis?")).toBeInTheDocument();
    expect(screen.getByText("1 of 2 answered")).toBeInTheDocument();
  });

  it("resumes at the first unanswered card from the session's reviews", async () => {
    getSessionMock.mockResolvedValue({
      ...sessionData,
      reviews: [{ id: 9, cardId: 1, correct: true }],
    });

    render(<StudyClient sessionId={5} />);

    expect(await screen.findByText("What is osmosis?")).toBeInTheDocument();
    expect(screen.queryByText("What is mitosis?")).not.toBeInTheDocument();
    expect(screen.getByText("1 of 2 answered")).toBeInTheDocument();
  });

  it("reaches the completion state after the last answer", async () => {
    getSessionMock.mockResolvedValue({
      ...sessionData,
      cards: [{ id: 1, front: "Only card", back: "Only back" }],
    });
    recordReviewMock.mockResolvedValue({ id: 1, cardId: 1, correct: false });

    render(<StudyClient sessionId={5} />);

    await screen.findByText("Only card");
    await userEvent.click(
      screen.getByRole("button", { name: "Reveal answer" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Incorrect" }));

    expect(
      await screen.findByRole("heading", { name: "Session complete" }),
    ).toBeInTheDocument();
    expect(screen.getByText("1 of 1 answered")).toBeInTheDocument();
    expect(
      screen.getByText("0 of 1 correct (0% accuracy)"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to the set" }),
    ).toHaveAttribute("href", "/sets/42");
    expect(
      screen.getByRole("link", { name: "Back to the dashboard" }),
    ).toHaveAttribute("href", "/dashboard");
  });

  it("renders the summary for a session that is not active", async () => {
    getSessionMock.mockResolvedValue({
      ...sessionData,
      session: { id: 5, setId: 42, status: "COMPLETED" },
      reviews: [{ id: 9, cardId: 1, correct: true }],
    });

    render(<StudyClient sessionId={5} />);

    expect(
      await screen.findByRole("heading", { name: "Session complete" }),
    ).toBeInTheDocument();
    expect(screen.getByText("1 of 2 answered")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Reveal answer" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to the set" }),
    ).toHaveAttribute("href", "/sets/42");
  });

  it("offers the way back when the set has no cards", async () => {
    getSessionMock.mockResolvedValue({ ...sessionData, cards: [] });

    render(<StudyClient sessionId={5} />);

    expect(
      await screen.findByText("This set has no cards to study yet."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to the set" }),
    ).toHaveAttribute("href", "/sets/42");
  });

  it("shows an error and stays on the card when recording fails", async () => {
    getSessionMock.mockResolvedValue(sessionData);
    recordReviewMock.mockRejectedValue(
      new ApiError("UNKNOWN", "Recording your answer failed. Try again."),
    );

    render(<StudyClient sessionId={5} />);

    await screen.findByText("What is mitosis?");
    await userEvent.click(
      screen.getByRole("button", { name: "Reveal answer" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Correct" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Recording your answer failed. Try again.",
    );
    expect(screen.getByText("What is mitosis?")).toBeInTheDocument();
    expect(recordReviewMock).toHaveBeenCalledTimes(1);
  });

  it("skips a card that can never be answered and advances", async () => {
    getSessionMock.mockResolvedValue(sessionData);
    recordReviewMock.mockRejectedValueOnce(
      new ApiError("CARD_NOT_FOUND", "This card no longer exists."),
    );

    render(<StudyClient sessionId={5} />);

    await screen.findByText("What is mitosis?");
    await userEvent.click(
      screen.getByRole("button", { name: "Reveal answer" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Correct" }));

    expect(await screen.findByText("What is osmosis?")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "This card no longer exists.",
    );
  });
});

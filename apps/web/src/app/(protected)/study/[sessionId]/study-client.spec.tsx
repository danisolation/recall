import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api";
import { StudyClient } from "./study-client";

const { getSessionMock, recordReviewMock, finishSessionMock } = vi.hoisted(
  () => ({
    getSessionMock: vi.fn(),
    recordReviewMock: vi.fn(),
    finishSessionMock: vi.fn(),
  }),
);

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
  finishSession: finishSessionMock,
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
    // Both flip faces stay mounted (ADR-013); before the reveal the answer
    // is hidden from the accessibility tree.
    expect(screen.getByText("Cell division").parentElement).toHaveAttribute(
      "aria-hidden",
      "true",
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Reveal answer" }),
    );

    expect(screen.getByText("Cell division").parentElement).not.toHaveAttribute(
      "aria-hidden",
    );
    expect(
      screen.getByText("What is mitosis?").parentElement,
    ).toHaveAttribute("aria-hidden", "true");
  });

  it("tracks progress in a progressbar", async () => {
    getSessionMock.mockResolvedValue({
      ...sessionData,
      reviews: [{ id: 9, cardId: 1, correct: true }],
    });

    render(<StudyClient sessionId={5} />);

    const bar = await screen.findByRole("progressbar", {
      name: "Session progress",
    });
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "2");
    expect(bar).toHaveAttribute("aria-valuenow", "1");
  });

  it("reveals with Space and answers with 1 and 2", async () => {
    getSessionMock.mockResolvedValue(sessionData);
    recordReviewMock.mockResolvedValue({ id: 1, cardId: 1, correct: false });

    render(<StudyClient sessionId={5} />);

    await screen.findByText("What is mitosis?");
    await userEvent.keyboard(" ");

    expect(screen.getByText("Cell division")).toBeInTheDocument();

    await userEvent.keyboard("1");
    expect(recordReviewMock).toHaveBeenCalledWith(5, {
      cardId: 1,
      correct: false,
    });
    expect(await screen.findByText("What is osmosis?")).toBeInTheDocument();

    await userEvent.keyboard(" ");
    expect(
      await screen.findByText("Diffusion of water"),
    ).toBeInTheDocument();
    await userEvent.keyboard("2");
    expect(recordReviewMock).toHaveBeenLastCalledWith(5, {
      cardId: 2,
      correct: true,
    });
  });

  it("ignores the answer keys while a button has focus", async () => {
    getSessionMock.mockResolvedValue(sessionData);
    recordReviewMock.mockResolvedValue({ id: 1, cardId: 1, correct: true });

    render(<StudyClient sessionId={5} />);

    await screen.findByText("What is mitosis?");
    await userEvent.click(
      screen.getByRole("button", { name: "Reveal answer" }),
    );

    // A focused button handles its own keys; the shortcuts must not
    // double-fire behind it.
    screen.getByRole("button", { name: "Correct" }).focus();
    await userEvent.keyboard("2");
    expect(recordReviewMock).not.toHaveBeenCalled();

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    await userEvent.keyboard("2");
    expect(recordReviewMock).toHaveBeenCalledWith(5, {
      cardId: 1,
      correct: true,
    });
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
    finishSessionMock.mockResolvedValue(undefined);

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
    // The accuracy numeral is a styled child (see CompletionView), so the
    // compound string is matched through textContent.
    expect(
      screen.getByText(
        (_, element) => element?.textContent === "0 of 1 correct (0% accuracy)",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to the set" }),
    ).toHaveAttribute("href", "/sets/42");
    expect(
      screen.getByRole("link", { name: "Back to the dashboard" }),
    ).toHaveAttribute("href", "/dashboard");
    // Completing the pass finishes the session (ADR-009).
    await vi.waitFor(() =>
      expect(finishSessionMock).toHaveBeenCalledWith(5),
    );
  });

  it("keeps the completion summary when finishing fails", async () => {
    getSessionMock.mockResolvedValue({
      ...sessionData,
      cards: [{ id: 1, front: "Only card", back: "Only back" }],
    });
    recordReviewMock.mockResolvedValue({ id: 1, cardId: 1, correct: true });
    finishSessionMock.mockRejectedValue(
      new ApiError("UNKNOWN", "Finishing the session failed. Try again."),
    );

    render(<StudyClient sessionId={5} />);

    await screen.findByText("Only card");
    await userEvent.click(
      screen.getByRole("button", { name: "Reveal answer" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Correct" }));

    expect(
      await screen.findByRole("heading", { name: "Session complete" }),
    ).toBeInTheDocument();
    expect(finishSessionMock).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
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
    // An already-finished session must not be finished again.
    expect(finishSessionMock).not.toHaveBeenCalled();
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
    expect(finishSessionMock).not.toHaveBeenCalled();
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

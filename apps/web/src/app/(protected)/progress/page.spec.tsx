import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ProgressPage from "./page";

const {
  getProgressSummaryMock,
  listDueCardsMock,
  listSessionHistoryMock,
} = vi.hoisted(() => ({
  getProgressSummaryMock: vi.fn(),
  listDueCardsMock: vi.fn(),
  listSessionHistoryMock: vi.fn(),
}));

vi.mock("@/lib/progress", () => ({
  getProgressSummary: getProgressSummaryMock,
  listDueCards: listDueCardsMock,
  listSessionHistory: listSessionHistoryMock,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const summary = { totalReviews: 4, correctReviews: 2, dueCount: 2 };

const dueCards = [
  {
    cardId: 7,
    front: "What is mitosis?",
    setId: 42,
    setTitle: "Spanish verbs",
    nextReviewAt: "2026-09-24T12:10:00.000Z",
  },
];

const history = [
  {
    id: 5,
    userId: 1,
    setId: 42,
    setTitle: "Spanish verbs",
    status: "COMPLETED",
    startedAt: "2026-02-01T00:00:00.000Z",
    finishedAt: "2026-02-01T12:00:00.000Z",
    createdAt: "2026-02-01T00:00:00.000Z",
    updatedAt: "2026-02-01T12:00:00.000Z",
  },
];

describe("ProgressPage", () => {
  it("renders the summary with the accuracy derived from the counts", async () => {
    getProgressSummaryMock.mockResolvedValue(summary);
    listDueCardsMock.mockResolvedValue({ items: [], nextOffset: null });
    listSessionHistoryMock.mockResolvedValue({ items: [], nextOffset: null });

    render(await ProgressPage());

    expect(
      screen.getByRole("heading", { name: "Progress" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Reviews")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getByText("Due cards")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("renders the zero-review and empty states honestly", async () => {
    getProgressSummaryMock.mockResolvedValue({
      totalReviews: 0,
      correctReviews: 0,
      dueCount: 0,
    });
    listDueCardsMock.mockResolvedValue({ items: [], nextOffset: null });
    listSessionHistoryMock.mockResolvedValue({ items: [], nextOffset: null });

    render(await ProgressPage());

    // No fabricated 0% for a user who has never answered anything.
    expect(screen.getByText("No answers yet")).toBeInTheDocument();
    expect(screen.queryByText("0%")).not.toBeInTheDocument();
    expect(
      screen.getByText("Nothing is due right now."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("You have not studied anything yet."),
    ).toBeInTheDocument();
  });

  it("links due cards to their sets", async () => {
    getProgressSummaryMock.mockResolvedValue(summary);
    listDueCardsMock.mockResolvedValue({ items: dueCards, nextOffset: null });
    listSessionHistoryMock.mockResolvedValue({ items: [], nextOffset: null });

    render(await ProgressPage());

    const link = screen.getByRole("link", { name: /What is mitosis\?/ });
    expect(link).toHaveAttribute("href", "/sets/42");
    expect(link).toHaveTextContent("Spanish verbs");
  });

  it("renders recent sessions with their status and date", async () => {
    getProgressSummaryMock.mockResolvedValue(summary);
    listDueCardsMock.mockResolvedValue({ items: [], nextOffset: null });
    listSessionHistoryMock.mockResolvedValue({
      items: history,
      nextOffset: null,
    });

    render(await ProgressPage());

    const link = screen.getByRole("link", { name: /Spanish verbs/ });
    expect(link).toHaveAttribute("href", "/sets/42");
    expect(link).toHaveTextContent("Completed");
    expect(link).toHaveTextContent("February 1, 2026");
  });
});

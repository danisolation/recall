import { headers } from "next/headers";

const API_ORIGIN = process.env.API_ORIGIN ?? "http://localhost:3001";

// ADR-016: the two streak facts arrive on the same response as the counts
// (no second fetch), derived server-side from the review history.
export type ProgressSummary = {
  totalReviews: number;
  correctReviews: number;
  dueCount: number;
  currentStreak: number;
  longestStreak: number;
};

// ADR-010's projection: identity and destination, not the back.
export type DueCard = {
  cardId: number;
  front: string;
  setId: number;
  setTitle: string;
  nextReviewAt: string;
};

export type PaginatedDueCards = {
  items: DueCard[];
  nextOffset: number | null;
};

export type SessionHistory = {
  id: number;
  userId: number;
  setId: number;
  setTitle: string;
  status: string;
  startedAt: string;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedSessionHistory = {
  items: SessionHistory[];
  nextOffset: number | null;
};

/**
 * The progress summary by asking the API with the browser's own cookie.
 * Same pattern as `lib/sets.ts`: the httpOnly cookie only exists
 * server-side, so this must run in a server component.
 */
export async function getProgressSummary(): Promise<ProgressSummary> {
  const cookie = (await headers()).get("cookie");

  if (!cookie) {
    return {
      totalReviews: 0,
      correctReviews: 0,
      dueCount: 0,
      currentStreak: 0,
      longestStreak: 0,
    };
  }

  const response = await fetch(`${API_ORIGIN}/progress`, {
    headers: { cookie },
    // Ownership-scoped per-request data; never cache it.
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Loading the progress summary failed.");
  }

  return (await response.json()) as ProgressSummary;
}

/**
 * The due queue's first page. No cookie means the protected layout already
 * gated the request, so the empty page skips the API entirely.
 */
export async function listDueCards(): Promise<PaginatedDueCards> {
  const cookie = (await headers()).get("cookie");

  if (!cookie) {
    return { items: [], nextOffset: null };
  }

  const response = await fetch(`${API_ORIGIN}/progress/due`, {
    headers: { cookie },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Loading the due cards failed.");
  }

  return (await response.json()) as PaginatedDueCards;
}

/**
 * The session history's first page, same pattern.
 */
export async function listSessionHistory(): Promise<PaginatedSessionHistory> {
  const cookie = (await headers()).get("cookie");

  if (!cookie) {
    return { items: [], nextOffset: null };
  }

  const response = await fetch(`${API_ORIGIN}/study-sessions`, {
    headers: { cookie },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Loading the history failed.");
  }

  return (await response.json()) as PaginatedSessionHistory;
}

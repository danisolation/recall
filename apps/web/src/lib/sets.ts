import { headers } from "next/headers";

const API_ORIGIN = process.env.API_ORIGIN ?? "http://localhost:3001";

export type StudySet = {
  id: number;
  ownerId: number;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedSets = {
  items: StudySet[];
  nextOffset: number | null;
};

/**
 * Lists the signed-in user's own sets by asking the API with the browser's
 * own cookie. Same pattern as `lib/session.ts`: the httpOnly cookie only
 * exists server-side, so this must run in a server component.
 */
export async function listSets(): Promise<PaginatedSets> {
  const cookie = (await headers()).get("cookie");

  if (!cookie) {
    return { items: [], nextOffset: null };
  }

  const response = await fetch(`${API_ORIGIN}/sets`, {
    headers: { cookie },
    // Ownership-scoped per-request data; never cache it.
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Loading your sets failed.");
  }

  return (await response.json()) as PaginatedSets;
}

/**
 * Fetches a single set by asking the API with the browser's own cookie,
 * same pattern as `listSets`. A 404 covers both a missing set and a set
 * owned by someone else (SET-006: the two are indistinguishable), and the
 * page turns `null` into `notFound()`.
 */
export async function getSet(id: number): Promise<StudySet | null> {
  const cookie = (await headers()).get("cookie");

  if (!cookie) {
    return null;
  }

  const response = await fetch(`${API_ORIGIN}/sets/${id}`, {
    headers: { cookie },
    // Ownership-scoped per-request data; never cache it.
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Loading the set failed.");
  }

  return (await response.json()) as StudySet;
}

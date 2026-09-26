import { headers } from "next/headers";

const API_ORIGIN = process.env.API_ORIGIN ?? "http://localhost:3001";

export type Card = {
  id: number;
  setId: number;
  front: string;
  back: string;
  position: number;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedCards = {
  items: Card[];
  nextOffset: number | null;
};

/**
 * Lists a set's cards in study order by asking the API with the browser's
 * own cookie. Same pattern as `lib/sets.ts`: the httpOnly cookie only
 * exists server-side, so this must run in a server component.
 */
export async function listCards(setId: number): Promise<PaginatedCards> {
  const cookie = (await headers()).get("cookie");

  if (!cookie) {
    return { items: [], nextOffset: null };
  }

  const response = await fetch(`${API_ORIGIN}/sets/${setId}/cards`, {
    headers: { cookie },
    // Ownership-scoped per-request data; never cache it.
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Loading the cards failed.");
  }

  return (await response.json()) as PaginatedCards;
}

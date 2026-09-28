const API_ORIGIN = process.env.API_ORIGIN ?? "http://localhost:3001";

// ADR-015's public payload: a whitelist of what a visitor needs. The
// owner's id, the folder placement, and the visibility token never leave
// the API, so the browser cannot over-fetch them either.
export type PublicSet = {
  title: string;
  description: string | null;
  tags: { id: number; name: string }[];
  cards: { id: number; front: string; back: string }[];
};

/**
 * Fetches a public set from the app's only unauthenticated endpoint. No
 * credentials and no cookie are sent — the visitor's session must never
 * ride along, and the endpoint would ignore it anyway. A 404 covers a
 * private, foreign, and missing set alike (indistinguishable by design),
 * and the page turns `null` into `notFound()`.
 */
export async function fetchPublicSet(id: number): Promise<PublicSet | null> {
  const response = await fetch(`${API_ORIGIN}/public/sets/${id}`, {
    // Visibility can flip at any moment (SHARE-004's toggle); never cache.
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Loading the set failed.");
  }

  return (await response.json()) as PublicSet;
}

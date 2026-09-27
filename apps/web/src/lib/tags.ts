import { headers } from "next/headers";

const API_ORIGIN = process.env.API_ORIGIN ?? "http://localhost:3001";

export type UserTag = {
  id: number;
  name: string;
};

/**
 * Lists the signed-in user's own tags (ADR-012) by asking the API with the
 * browser's own cookie, same pattern as `listSets`. They back the
 * dashboard's filter links.
 */
export async function listTags(): Promise<UserTag[]> {
  const cookie = (await headers()).get("cookie");

  if (!cookie) {
    return [];
  }

  const response = await fetch(`${API_ORIGIN}/tags`, {
    headers: { cookie },
    // Ownership-scoped per-request data; never cache it.
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Loading your tags failed.");
  }

  return (await response.json()) as UserTag[];
}

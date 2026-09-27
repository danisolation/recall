import { headers } from "next/headers";

const API_ORIGIN = process.env.API_ORIGIN ?? "http://localhost:3001";

export type FolderSummary = {
  id: number;
  name: string;
  setCount: number;
};

/**
 * Lists the signed-in user's own folders with their set counts (ADR-014)
 * by asking the API with the browser's own cookie, same pattern as
 * `listTags`. They back the dashboard's folder filter row.
 */
export async function listFolders(): Promise<FolderSummary[]> {
  const cookie = (await headers()).get("cookie");

  if (!cookie) {
    return [];
  }

  const response = await fetch(`${API_ORIGIN}/folders`, {
    headers: { cookie },
    // Ownership-scoped per-request data; never cache it.
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Loading your folders failed.");
  }

  return (await response.json()) as FolderSummary[];
}

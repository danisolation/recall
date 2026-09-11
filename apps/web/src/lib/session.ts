import { cache } from "react";
import { headers } from "next/headers";

const API_ORIGIN = process.env.API_ORIGIN ?? "http://localhost:3001";

export type AuthUser = {
  id: number;
  email: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * Reads the session for the current request by asking the API with the
 * browser's own cookie. The cookie is httpOnly, so it can only be inspected
 * here on the server — the client can never read or forge it.
 *
 * Wrapped in `cache` so the layout and the page it wraps share one lookup per
 * request instead of each hitting `GET /auth/me`.
 */
export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const cookie = (await headers()).get("cookie");

  if (!cookie) {
    return null;
  }

  const response = await fetch(`${API_ORIGIN}/auth/me`, {
    headers: { cookie },
    // Session state is per-user and per-request; never cache it.
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as AuthUser;
});

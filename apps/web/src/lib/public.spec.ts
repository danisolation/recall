import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchPublicSet } from "./public";
import type { PublicSet } from "./public";

const set: PublicSet = {
  title: "Spanish verbs",
  description: "Common irregular verbs",
  tags: [
    { id: 7, name: "biology" },
    { id: 8, name: "exam prep" },
  ],
  cards: [
    { id: 1, front: "What is mitosis?", back: "Cell division" },
    { id: 2, front: "What is osmosis?", back: "Diffusion of water" },
  ],
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchPublicSet", () => {
  it("fetches the public endpoint without any credentials", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => set,
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchPublicSet(42)).resolves.toEqual(set);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/public/sets/42",
      expect.objectContaining({ cache: "no-store" }),
    );
    // No cookie forwarding and no credentials: the endpoint is public and
    // must never carry the visitor's session.
    const options = fetchMock.mock.calls[0]?.[1];
    expect(options).toBeDefined();
    expect(options).not.toHaveProperty("headers");
    expect(options).not.toHaveProperty("credentials");
  });

  it("maps a 404 to null", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ code: "SET_NOT_FOUND" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchPublicSet(42)).resolves.toBeNull();
  });

  it("throws on other API failures", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchPublicSet(42)).rejects.toThrow(
      "Loading the set failed.",
    );
  });
});

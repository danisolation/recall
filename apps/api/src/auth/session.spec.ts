import { describe, expect, it } from "vitest";
import { createSessionToken, hashToken } from "./session";

describe("hashToken", () => {
  it("hashes a token as sha-256 hex", () => {
    expect(hashToken("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });

  it("produces different hashes for different tokens", () => {
    expect(hashToken("abc")).not.toBe(hashToken("abd"));
  });
});

describe("createSessionToken", () => {
  const now = new Date("2026-01-01T00:00:00.000Z");

  it("returns a 256-bit base64url token", () => {
    const { token } = createSessionToken(now);

    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });

  it("returns a unique token per call", () => {
    const first = createSessionToken(now);
    const second = createSessionToken(now);

    expect(first.token).not.toBe(second.token);
  });

  it("hashes the returned token", () => {
    const { token, tokenHash } = createSessionToken(now);

    expect(tokenHash).toBe(hashToken(token));
  });

  it("sets the expiry one week out", () => {
    const { expiresAt } = createSessionToken(now);

    expect(expiresAt.getTime()).toBe(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  });
});

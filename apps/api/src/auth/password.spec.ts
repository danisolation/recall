import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  it("stores a hash that does not contain the plaintext password", async () => {
    const passwordHash = await hashPassword("correct horse battery staple");

    expect(passwordHash).not.toContain("correct horse battery staple");
    expect(passwordHash).toMatch(/^\$argon2id\$/);
  });

  it("produces a unique hash for the same password", async () => {
    const first = await hashPassword("correct horse battery staple");
    const second = await hashPassword("correct horse battery staple");

    expect(first).not.toBe(second);
  });

  it("verifies the correct password", async () => {
    const passwordHash = await hashPassword("correct horse battery staple");

    await expect(
      verifyPassword(passwordHash, "correct horse battery staple"),
    ).resolves.toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const passwordHash = await hashPassword("correct horse battery staple");

    await expect(verifyPassword(passwordHash, "wrong password")).resolves.toBe(
      false,
    );
  });

  it("rejects a malformed stored hash without throwing", async () => {
    await expect(verifyPassword("not-a-valid-hash", "any password")).resolves.toBe(
      false,
    );
  });
});

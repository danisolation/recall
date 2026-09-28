// @vitest-environment node
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";

// The tokens are CSS, not JavaScript, so the guarantee this file enforces is
// structural: the new identity is declared, the retired one is gone, and the
// two behavioral rules ADR-013 put in this file survive the rewrite.
const css = readFileSync(
  fileURLToPath(new URL("./globals.css", import.meta.url)),
  "utf8",
);

const theme = css.slice(css.indexOf("@theme"), css.indexOf("@layer base"));

describe("design tokens (ADR-018)", () => {
  it("declares every token the components consume", () => {
    // Same names as the retired set, so no consumer file had to be edited —
    // the payoff of the token-first ordering.
    for (const token of [
      "paper",
      "card",
      "ink",
      "ink-soft",
      "marker",
      "marker-deep",
      "alert",
    ]) {
      expect(theme).toContain(`--color-${token}:`);
    }
    expect(theme).toContain("--radius-card:");
  });

  it("uses the claymorphism palette", () => {
    // The generated primary, accent, and background, adopted on verified
    // contrast (ADR-018) rather than on the generator's authority.
    expect(theme).toContain("--color-marker:"); // primary #7C3AED
    expect(theme).toContain("--color-alert:"); // destructive #DC2626
    expect(theme).toContain("#7c3aed");
    expect(theme).toContain("#059669");
  });

  it("carries 16-24px radii and the inner+outer double shadow", () => {
    expect(theme).toMatch(/--radius-card:\s*1(\.\d+)?rem/);
    expect(theme).toContain("--shadow-clay:");
  });

  it("pairs Baloo 2 for display with Comic Neue for body", () => {
    expect(css).toContain("Baloo+2");
    expect(css).toContain("Comic+Neue");
  });

  it("retires the old card-stock palette", () => {
    // The warm oklch paper/ink/marker triple from ADR-008 must be gone;
    // `alert` is intentionally kept as a name but now means destructive.
    expect(theme).not.toMatch(/--color-paper:\s*oklch/);
    expect(theme).not.toMatch(/--color-ink:\s*oklch/);
    expect(theme).not.toMatch(/--color-marker:\s*oklch/);
  });
});

describe("retained behavior (ADR-013)", () => {
  it("keeps the reduced-motion kill-switch", () => {
    expect(css).toContain("prefers-reduced-motion: reduce");
  });

  it("keeps the study card's flip rules", () => {
    expect(css).toContain(".flip-card-inner");
    expect(css).toContain("backface-visibility: hidden");
  });
});

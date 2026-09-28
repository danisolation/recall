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

// The form controls live in `components/ui`, two levels up from `src/app`.
const inputPath = fileURLToPath(
  new URL("../components/ui/input.tsx", import.meta.url),
);
const selectPath = fileURLToPath(
  new URL("../components/ui/select.tsx", import.meta.url),
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

/*
 * The REDESIGN-009 audit. These are the two pairings that were measured
 * against §57 and found failing, so they are pinned here at the values that
 * fixed them — a number in a commit message does not stop the next person
 * from dialing the alpha back down.
 *
 * Both were computed with WCAG relative luminance and sRGB alpha
 * compositing, not estimated:
 *
 *   placeholder text — `ink-soft #475569` at /70 over `#FFFFFF` composites
 *     to `#7E8896`, which is **3.59:1** and fails the 4.5:1 body-text
 *     requirement. At /80 it composites to `#6C7787` = **4.54:1**, the
 *     lightest value that clears it. Placeholders are still text and are
 *     read by anyone typing into a field.
 *
 *   form-control border — `border #EFE7FC` on `#FFFFFF` is **1.20:1**. A
 *     control's boundary is a non-text UI element under WCAG 1.4.11 and
 *     needs 3:1; this one was effectively invisible. `ink-soft` is
 *     **7.58:1**, comfortably clear.
 */
describe("verified contrast pairings (REDESIGN-009)", () => {
  it("keeps the placeholder at a lightness that clears 4.5:1", () => {
    expect(theme).toContain("--color-ink-soft: #475569");
    // /70 = 3.59:1 (fails). /80 = 4.54:1 (passes).
    expect(readFileSync(inputPath, "utf8")).toContain(
      "placeholder:text-ink-soft/80",
    );
    expect(readFileSync(inputPath, "utf8")).not.toContain(
      "placeholder:text-ink-soft/70",
    );
  });

  it("gives form controls a boundary that clears 3:1", () => {
    // `border-border` (#EFE7FC) is 1.20:1 on card and cannot be used for a
    // control's edge; the register moves to the soft ink for controls only.
    // Matched against the class string so the explanatory comments — which
    // legitimately name the retired class — do not trip the assertion.
    const controlClass = (source: string) =>
      source.match(/className=\{`([^`]+)`/)?.[1] ?? "";
    for (const source of [
      readFileSync(inputPath, "utf8"),
      readFileSync(selectPath, "utf8"),
    ]) {
      const classes = controlClass(source);
      expect(classes).toContain("border-ink-soft");
      expect(classes).not.toContain("border-border");
    }
  });
});

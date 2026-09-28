import type { ComponentProps } from "react";

type InputProps = ComponentProps<"input">;

// ADR-018: the field is a soft-pressed clay tile — 1.25rem radius, a 3px
// border, and the inner top-light from the clay shadow. Focus styling is no
// longer repeated here: the single `:focus-visible` rule in globals.css owns
// it, which is also what covers the surfaces the register doesn't reach.
//
// REDESIGN-009 (§57), two measured corrections:
//   `border-border` (#EFE7FC) is 1.20:1 on the card surface. A control's edge
//   is a non-text UI element under WCAG 1.4.11 and needs 3:1, so the field
//   border moves to `ink-soft` (7.58:1). Only form controls change — the
//   panel register keeps `border-border`, which is decorative, not a boundary.
//   The placeholder was `ink-soft` at /70 = 3.59:1, below the 4.5:1 body-text
//   floor; /80 composites to #6C7787 = 4.54:1, the lightest value that clears.
export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`h-12 w-full rounded-xl border-[3px] border-ink-soft bg-card px-4 text-base text-ink shadow-clay transition-colors placeholder:text-ink-soft/80 focus:border-marker aria-invalid:border-alert motion-reduce:transition-none ${className}`}
      {...props}
    />
  );
}

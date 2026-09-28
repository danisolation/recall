import type { ComponentProps } from "react";

type SelectProps = ComponentProps<"select">;

// A native control styled like the Input primitive (§24: semantic HTML over
// widgets). ADR-018: same clay register — 1.25rem radius, 3px border, clay
// shadow — so the two controls are visually indistinguishable in a form.
// REDESIGN-009 (§57): the border moves to `ink-soft` because `border-border`
// is 1.20:1 against the card surface, and a control's edge is a non-text UI
// element that must clear 3:1.
export function Select({ className = "", ...props }: SelectProps) {
  return (
    <select
      className={`h-12 w-full rounded-xl border-[3px] border-ink-soft bg-card px-4 text-base text-ink shadow-clay transition-colors focus:border-marker motion-reduce:transition-none ${className}`}
      {...props}
    />
  );
}

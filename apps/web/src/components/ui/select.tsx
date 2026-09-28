import type { ComponentProps } from "react";

type SelectProps = ComponentProps<"select">;

// A native control styled like the Input primitive (§24: semantic HTML over
// widgets). ADR-018: same clay register — 1.25rem radius, 3px border, clay
// shadow — so the two controls are visually indistinguishable in a form.
export function Select({ className = "", ...props }: SelectProps) {
  return (
    <select
      className={`h-12 w-full rounded-xl border-[3px] border-border bg-card px-4 text-base text-ink shadow-clay transition-colors focus:border-marker motion-reduce:transition-none ${className}`}
      {...props}
    />
  );
}

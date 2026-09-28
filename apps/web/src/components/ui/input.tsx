import type { ComponentProps } from "react";

type InputProps = ComponentProps<"input">;

// ADR-018: the field is a soft-pressed clay tile — 1.25rem radius, a 3px
// border, and the inner top-light from the clay shadow. Focus styling is no
// longer repeated here: the single `:focus-visible` rule in globals.css owns
// it, which is also what covers the surfaces the register doesn't reach.
export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`h-12 w-full rounded-xl border-[3px] border-border bg-card px-4 text-base text-ink shadow-clay transition-colors placeholder:text-ink-soft/70 focus:border-marker aria-invalid:border-alert motion-reduce:transition-none ${className}`}
      {...props}
    />
  );
}

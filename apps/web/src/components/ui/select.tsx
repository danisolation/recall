import type { ComponentProps } from "react";

type SelectProps = ComponentProps<"select">;

// ADR-014: the folder select — a native control styled like the Input
// primitive (§24: semantic HTML over widgets).
export function Select({ className = "", ...props }: SelectProps) {
  return (
    <select
      className={`h-11 w-full rounded-md border border-ink/25 bg-card px-3 text-base text-ink transition-colors focus:border-ink focus:outline-2 focus:outline-offset-2 focus:outline-ink motion-reduce:transition-none ${className}`}
      {...props}
    />
  );
}

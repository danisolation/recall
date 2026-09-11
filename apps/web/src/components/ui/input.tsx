import type { ComponentProps } from "react";

type InputProps = ComponentProps<"input">;

export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`h-11 w-full rounded-md border border-ink/25 bg-card px-3 text-base text-ink transition-colors placeholder:text-ink-soft/60 focus:border-ink focus:outline-2 focus:outline-offset-2 focus:outline-ink motion-reduce:transition-none ${className}`}
      {...props}
    />
  );
}

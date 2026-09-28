import type { ComponentProps } from "react";

// The waiting state (ADR-013): a quiet block that pulses. animate-pulse
// animates opacity only, so the global reduced-motion kill-switch freezes
// it; aria-hidden because the real content arrives momentarily.
// ADR-018: the muted lavender surface with the clay radius, replacing the
// old ink wash.
export function Skeleton({ className = "", ...props }: ComponentProps<"div">) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-xl bg-muted ${className}`}
      {...props}
    />
  );
}

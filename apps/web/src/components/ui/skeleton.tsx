import type { ComponentProps } from "react";

// The waiting state (ADR-013): a quiet block that pulses. animate-pulse
// animates opacity only, so the global reduced-motion kill-switch freezes
// it; aria-hidden because the real content arrives momentarily.
export function Skeleton({ className = "", ...props }: ComponentProps<"div">) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-sm bg-ink/10 ${className}`}
      {...props}
    />
  );
}

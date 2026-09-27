import Link from "next/link";
import type { ComponentProps } from "react";

// The link register from ADR-008, centralized by ADR-013 (UX-002).
// `TextLink` renders the next/link form; use `linkClassName` directly on
// buttons styled as links (MoveCardButton, DeleteCardButton).
export const linkClassName =
  "rounded-sm font-medium underline underline-offset-4 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

// The button register (ADR-008's Button base + secondary colors) applied to
// a link (ADR-013/UX-003): nav actions get real-button weight without
// losing their link semantics. `gap-2` seats an optional icon.
export const buttonLinkClassName =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-ink/25 bg-card px-4 text-base font-medium text-ink transition-colors hover:bg-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:translate-y-px motion-reduce:transition-none";

export function TextLink({
  className,
  variant = "link",
  ...props
}: ComponentProps<typeof Link> & { variant?: "link" | "button" }) {
  const base = variant === "button" ? buttonLinkClassName : linkClassName;

  return (
    <Link
      className={className ? `${base} ${className}` : base}
      {...props}
    />
  );
}

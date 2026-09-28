import Link from "next/link";
import type { ComponentProps } from "react";

/*
 * The link register from ADR-008, centralized by ADR-013 (UX-002).
 * `TextLink` renders the next/link form; use `linkClassName` directly on
 * buttons styled as links (MoveCardButton, DeleteCardButton).
 * ADR-018: the underline is colored with the primary on hover so the affordance
 * reads without relying on weight alone, and focus is left to the single
 * `:focus-visible` rule in globals.css.
 */
export const linkClassName =
  "rounded-md font-semibold text-ink underline decoration-marker/40 underline-offset-4 transition-colors hover:text-marker hover:decoration-marker motion-reduce:transition-none";

/*
 * The button register applied to a link (ADR-013/UX-003): nav actions get
 * real-button weight without losing their link semantics. `gap-2` seats an
 * optional icon.
 */
export const buttonLinkClassName =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border-[3px] border-border bg-card px-4 text-base font-semibold text-ink shadow-clay transition-[transform,box-shadow,background-color] hover:bg-muted active:translate-y-0.5 active:shadow-clay-pressed motion-reduce:transition-none";

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

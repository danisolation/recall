import Link from "next/link";
import type { ComponentProps } from "react";

// The link register from ADR-008, centralized by ADR-013 (UX-002).
// `TextLink` renders the next/link form; use `linkClassName` directly on
// buttons styled as links (MoveCardButton, DeleteCardButton).
export const linkClassName =
  "rounded-sm font-medium underline underline-offset-4 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

export function TextLink({
  className,
  ...props
}: ComponentProps<typeof Link>) {
  return (
    <Link
      className={className ? `${linkClassName} ${className}` : linkClassName}
      {...props}
    />
  );
}

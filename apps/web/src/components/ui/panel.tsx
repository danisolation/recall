import type { ComponentProps } from "react";

// The panel register from ADR-008, centralized by ADR-013 (UX-002) so a
// styling change is a one-file edit. Re-skinned by ADR-018: the hard 4px
// offset becomes the clay double shadow, and the border thickens to 3px so
// the surface reads as a molded tile rather than a hairline card.
// `Panel` renders the section form; use `panelClassName` directly on divs,
// list items, and links that share the register.
export const panelClassName =
  "rounded-card border-[3px] border-border bg-card p-4 shadow-clay sm:p-6";

export function Panel({ className, ...props }: ComponentProps<"section">) {
  return (
    <section
      className={className ? `${panelClassName} ${className}` : panelClassName}
      {...props}
    />
  );
}

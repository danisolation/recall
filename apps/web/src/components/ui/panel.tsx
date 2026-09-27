import type { ComponentProps } from "react";

// The panel register from ADR-008, centralized by ADR-013 (UX-002) so a
// styling change is a one-file edit. `Panel` renders the section form; use
// `panelClassName` directly on divs, list items, and links that share the
// register.
export const panelClassName =
  "rounded-card border border-ink/10 bg-card p-4 shadow-[4px_4px_0_0] shadow-ink/15 sm:p-6";

export function Panel({ className, ...props }: ComponentProps<"section">) {
  return (
    <section
      className={className ? `${panelClassName} ${className}` : panelClassName}
      {...props}
    />
  );
}

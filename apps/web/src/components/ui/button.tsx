import type { ComponentProps } from "react";

const base =
  "inline-flex min-h-11 items-center justify-center rounded-xl border-[3px] px-4 text-base font-semibold transition-[transform,box-shadow,background-color] disabled:pointer-events-none disabled:opacity-50 active:translate-y-0.5 active:shadow-clay-pressed motion-reduce:transition-none";

/*
 * ADR-018: `text-white` is pinned on the primary rather than inherited.
 * The primary background is `marker` #7C3AED (5.70:1 against white), but the
 * soft-press state can expose `marker-deep` #6D28D9, and white on that is
 * only 3.77:1 — a contrast failure. The secondary variant sits on a light
 * surface and keeps the dark ink, so the color belongs to the variant, not
 * the base.
 */
const variants = {
  primary: "border-marker-deep bg-marker text-white hover:bg-marker-deep",
  secondary: "border-border bg-card text-ink hover:bg-muted",
} as const;

type ButtonProps = ComponentProps<"button"> & {
  variant?: keyof typeof variants;
};

export function Button({
  className = "",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${base} shadow-clay ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

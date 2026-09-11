import type { ComponentProps } from "react";

const base =
  "inline-flex min-h-11 items-center justify-center rounded-md border px-4 text-base font-medium text-ink transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:translate-y-px disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none";

// The marker accent is reserved for primary actions (ADR-008); everything
// else in the system stays neutral.
const variants = {
  primary: "border-ink/20 bg-marker hover:bg-marker-deep",
  secondary: "border-ink/25 bg-card hover:bg-paper",
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
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

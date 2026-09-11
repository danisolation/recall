import type { ComponentProps } from "react";

type ButtonProps = ComponentProps<"button">;

export function Button({ className = "", type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-11 items-center justify-center rounded-md border border-ink/20 bg-marker px-4 text-base font-medium text-ink transition-colors hover:bg-marker-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:translate-y-px disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none ${className}`}
      {...props}
    />
  );
}

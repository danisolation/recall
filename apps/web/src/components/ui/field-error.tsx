import type { ComponentProps } from "react";

type FieldErrorProps = ComponentProps<"p">;

export function FieldError({ className = "", children, ...props }: FieldErrorProps) {
  if (!children) {
    return null;
  }

  return (
    <p role="alert" className={`text-sm text-alert ${className}`} {...props}>
      {children}
    </p>
  );
}

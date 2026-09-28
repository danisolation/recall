import { CircleAlert } from "lucide-react";
import type { ComponentProps } from "react";

type FieldErrorProps = ComponentProps<"p">;

/*
 * ADR-018 / §57: the destructive state is signalled by an icon *and* color,
 * never color alone — red text on its own fails anyone who cannot separate
 * the hue. The icon is decorative (`aria-hidden`); the `role="alert"` live
 * region and the message text carry the meaning to assistive technology.
 */
export function FieldError({
  className = "",
  children,
  ...props
}: FieldErrorProps) {
  if (!children) {
    return null;
  }

  return (
    <p
      role="alert"
      className={`flex items-center gap-1.5 text-sm font-medium text-alert ${className}`}
      {...props}
    >
      <CircleAlert aria-hidden className="h-4 w-4 shrink-0" />
      {children}
    </p>
  );
}

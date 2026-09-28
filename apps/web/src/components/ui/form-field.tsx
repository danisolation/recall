import type { ComponentProps, ReactNode } from "react";
import { FieldError } from "./field-error";
import { Input } from "./input";

type FormFieldProps = {
  label: string;
  id: string;
  error?: string;
  /** Renders a custom control (e.g. a Select) instead of the default Input. */
  children?: ReactNode;
} & ComponentProps<"input">;

// ADR-018: the label no longer paints a highlighter wash behind itself; the
// field's own clay tile is the affordance, and the label highlights with
// color alone when the group holds focus.
export function FormField({
  label,
  id,
  error,
  children,
  ...inputProps
}: FormFieldProps) {
  return (
    <div className="group flex flex-col gap-2">
      <label
        htmlFor={id}
        className="w-fit rounded-md px-1 text-sm font-semibold text-ink transition-colors group-focus-within:text-marker motion-reduce:transition-none"
      >
        {label}
      </label>
      {children ?? (
        <Input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          {...inputProps}
        />
      )}
      <FieldError id={`${id}-error`}>{error}</FieldError>
    </div>
  );
}

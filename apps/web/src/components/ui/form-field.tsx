import type { ComponentProps } from "react";
import { FieldError } from "./field-error";
import { Input } from "./input";

type FormFieldProps = {
  label: string;
  id: string;
  error?: string;
} & ComponentProps<"input">;

export function FormField({ label, id, error, ...inputProps }: FormFieldProps) {
  return (
    <div className="group flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="-mx-1 w-fit rounded-sm px-1 text-sm font-medium transition-colors group-focus-within:bg-marker/80 motion-reduce:transition-none"
      >
        {label}
      </label>
      <Input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...inputProps}
      />
      <FieldError id={`${id}-error`}>{error}</FieldError>
    </div>
  );
}

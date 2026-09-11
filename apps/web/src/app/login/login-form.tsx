"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ComponentProps } from "react";
import { useForm } from "react-hook-form";
import { loginSchema, type LoginInput } from "@danisolation-recall/contracts";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";

function Field({
  label,
  id,
  error,
  ...inputProps
}: {
  label: string;
  id: string;
  error?: string;
} & ComponentProps<"input">) {
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

export function LoginForm({
  onValid,
}: {
  onValid?: (values: LoginInput) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form
      className="flex flex-col gap-4"
      noValidate
      onSubmit={handleSubmit((values) => onValid?.(values))}
    >
      <Field
        label="Email"
        id="email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <Field
        label="Password"
        id="password"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
      />
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        Log in
      </Button>
    </form>
  );
}

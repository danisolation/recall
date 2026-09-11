"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";
import { useForm } from "react-hook-form";
import { loginSchema } from "@danisolation-recall/contracts";
import { ApiError, loginUser } from "@/lib/api";
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

export function LoginForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form
      className="flex flex-col gap-4"
      noValidate
      onSubmit={handleSubmit(async (values) => {
        try {
          await loginUser(values);
          router.replace("/");
        } catch (error) {
          if (
            error instanceof ApiError &&
            error.code === "INVALID_CREDENTIALS"
          ) {
            setError("root", { message: error.message });
          } else {
            setError("root", { message: "Logging in failed. Try again." });
          }
        }
      })}
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
      {errors.root?.message ? (
        <FieldError>{errors.root.message}</FieldError>
      ) : null}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        Log in
      </Button>
    </form>
  );
}

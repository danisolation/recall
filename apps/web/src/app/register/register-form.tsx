"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { registerSchema } from "@danisolation-recall/contracts";
import { ApiError, loginUser, registerUser } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { FormField } from "@/components/ui/form-field";

export function RegisterForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  return (
    <form
      className="flex flex-col gap-4"
      noValidate
      onSubmit={handleSubmit(async (values) => {
        try {
          await registerUser(values);
          // Registration does not start a session, so sign the new user in
          // rather than making them retype what they just entered.
          await loginUser(values);
          router.replace("/");
        } catch (error) {
          if (
            error instanceof ApiError &&
            error.code === "EMAIL_ALREADY_REGISTERED"
          ) {
            setError("root", { message: error.message });
          } else {
            setError("root", {
              message: "Creating your account failed. Try again.",
            });
          }
        }
      })}
    >
      <FormField
        label="Email"
        id="email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <FormField
        label="Password"
        id="password"
        type="password"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register("password")}
      />
      {errors.root?.message ? (
        <FieldError>{errors.root.message}</FieldError>
      ) : null}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        Create account
      </Button>
    </form>
  );
}

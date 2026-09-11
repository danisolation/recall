"use client";

import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function Field({
  label,
  id,
  ...inputProps
}: {
  label: string;
  id: string;
} & ComponentProps<"input">) {
  return (
    <div className="group flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="-mx-1 w-fit rounded-sm px-1 text-sm font-medium transition-colors group-focus-within:bg-marker/80 motion-reduce:transition-none"
      >
        {label}
      </label>
      <Input id={id} name={id} {...inputProps} />
    </div>
  );
}

export function LoginForm() {
  return (
    <form className="flex flex-col gap-4">
      <Field label="Email" id="email" type="email" autoComplete="email" />
      <Field
        label="Password"
        id="password"
        type="password"
        autoComplete="current-password"
      />
      <Button type="submit" className="w-full">
        Log in
      </Button>
    </form>
  );
}

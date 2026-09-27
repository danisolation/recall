import type { Metadata } from "next";
import { UserPlus } from "lucide-react";
import { Panel } from "@/components/ui/panel";
import { TextLink } from "@/components/ui/text-link";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Create an account — DANISOLATION Recall",
};

export default function RegisterPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-9">
      <div className="w-full max-w-sm">
        <div className="mb-4 flex justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-marker/40">
            <UserPlus aria-hidden className="h-5 w-5 text-ink" />
          </span>
        </div>
        <h1 className="mb-4 text-center text-2xl font-semibold tracking-tight">
          Create your{" "}
          <span className="rounded-sm bg-marker/70 px-1">Recall</span> account
        </h1>
        <Panel>
          <RegisterForm />
        </Panel>
        <p className="mt-4 text-center text-sm text-ink-soft">
          Already have an account?{" "}
          <TextLink href="/login">Log in</TextLink>
        </p>
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import { LogIn } from "lucide-react";
import { Panel } from "@/components/ui/panel";
import { TextLink } from "@/components/ui/text-link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Log in — DANISOLATION Recall",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-9">
      <div className="w-full max-w-sm">
        <div className="mb-4 flex justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-marker/40">
            <LogIn aria-hidden className="h-5 w-5 text-ink" />
          </span>
        </div>
        <h1 className="mb-4 text-center text-2xl font-semibold tracking-tight">
          Log in to{" "}
          <span className="rounded-md bg-marker/70 px-1">Recall</span>
        </h1>
        <Panel>
          <LoginForm />
        </Panel>
        <p className="mt-4 text-center text-sm text-ink-soft">
          New here?{" "}
          <TextLink href="/register">Create an account</TextLink>
        </p>
      </div>
    </main>
  );
}

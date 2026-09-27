import type { Metadata } from "next";
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
        <h1 className="mb-4 text-2xl font-semibold tracking-tight">
          Log in to{" "}
          <span className="rounded-sm bg-marker/70 px-1">Recall</span>
        </h1>
        <Panel>
          <LoginForm />
        </Panel>
        <p className="mt-4 text-sm text-ink-soft">
          New here?{" "}
          <TextLink href="/register">Create an account</TextLink>
        </p>
      </div>
    </main>
  );
}

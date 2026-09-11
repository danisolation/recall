import type { Metadata } from "next";
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
        <div className="rounded-card border border-ink/10 bg-card p-4 shadow-[4px_4px_0_0] shadow-ink/15 sm:p-6">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Create an account — DANISOLATION Recall",
};

export default function RegisterPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-9">
      <div className="w-full max-w-sm">
        <h1 className="mb-4 text-2xl font-semibold tracking-tight">
          Create your{" "}
          <span className="rounded-sm bg-marker/70 px-1">Recall</span> account
        </h1>
        <div className="rounded-card border border-ink/10 bg-card p-4 shadow-[4px_4px_0_0] shadow-ink/15 sm:p-6">
          <RegisterForm />
        </div>
        <p className="mt-4 text-sm text-ink-soft">
          Already have an account?{" "}
          <Link
            href="/login"
            className="rounded-sm font-medium underline underline-offset-4 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}

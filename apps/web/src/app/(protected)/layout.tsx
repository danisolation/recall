import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { UserMenu } from "@/components/user-menu";
import { getCurrentUser } from "@/lib/session";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-dvh flex-col">
      {/* WCAG 2.4.1 bypass (A11Y-001): the first focusable element jumps
          straight to the content. Visually hidden until focused, and
          absolutely positioned when shown so no layout shifts. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:rounded-sm focus:bg-card focus:px-4 focus:py-3 focus:font-medium focus:underline focus:outline-2 focus:outline-offset-2 focus:outline-ink"
      >
        Skip to content
      </a>
      <header className="border-b border-ink/10 bg-card">
        <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link
            href="/"
            className="rounded-sm text-lg font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            DANISOLATION{" "}
            <span className="rounded-sm bg-marker/70 px-1">Recall</span>
          </Link>
          <UserMenu email={user.email} />
        </div>
      </header>
      <main
        id="main-content"
        className="mx-auto w-full max-w-3xl flex-1 px-4 py-9"
      >
        {children}
      </main>
    </div>
  );
}

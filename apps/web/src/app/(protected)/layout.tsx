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
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-9">
        {children}
      </main>
    </div>
  );
}

import Link from "next/link";
import { UserMenu } from "@/components/user-menu";
import { getCurrentUser } from "@/lib/session";

const navLink =
  "rounded-sm font-medium underline underline-offset-4 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col gap-8 px-4 py-9">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          DANISOLATION{" "}
          <span className="rounded-sm bg-marker/70 px-1">Recall</span>
        </h1>
        {user ? (
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/dashboard" className={navLink}>
              Dashboard
            </Link>
            <UserMenu email={user.email} />
          </div>
        ) : (
          <nav className="flex items-center gap-4 text-sm text-ink-soft">
            <Link href="/login" className={navLink}>
              Log in
            </Link>
            <Link href="/register" className={navLink}>
              Create account
            </Link>
          </nav>
        )}
      </header>
      <section className="rounded-card border border-ink/10 bg-card p-4 shadow-[4px_4px_0_0] shadow-ink/15 sm:p-6">
        <p className="text-ink-soft">
          A modern flashcard and learning platform.
        </p>
      </section>
    </main>
  );
}

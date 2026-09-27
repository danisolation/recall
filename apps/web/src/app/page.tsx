import { Panel } from "@/components/ui/panel";
import { TextLink } from "@/components/ui/text-link";
import { UserMenu } from "@/components/user-menu";
import { getCurrentUser } from "@/lib/session";

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
            <TextLink href="/dashboard">Dashboard</TextLink>
            <UserMenu email={user.email} />
          </div>
        ) : (
          <nav className="flex items-center gap-4 text-sm text-ink-soft">
            <TextLink href="/login">Log in</TextLink>
            <TextLink href="/register">Create account</TextLink>
          </nav>
        )}
      </header>
      <Panel>
        <p className="text-ink-soft">
          A modern flashcard and learning platform.
        </p>
      </Panel>
    </main>
  );
}

import { GraduationCap, Layers, Plus } from "lucide-react";
import { Panel } from "@/components/ui/panel";
import { TextLink } from "@/components/ui/text-link";
import { UserMenu } from "@/components/user-menu";
import { getCurrentUser } from "@/lib/session";

// One line each; the trio only shows to signed-out visitors — for a signed-in
// user this page is the doorway, not a pitch (ADR-008's product register).
const features = [
  {
    icon: Plus,
    title: "Create",
    line: "Start a set for any subject in seconds.",
  },
  {
    icon: Layers,
    title: "Cards",
    line: "Two sides per card, ordered the way you study them.",
  },
  {
    icon: GraduationCap,
    title: "Study",
    line: "Grade each answer and the schedule picks what's next.",
  },
];

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col gap-8 px-4 py-9">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          DANISOLATION{" "}
          <span className="rounded-sm bg-marker/70 px-1">Recall</span>
        </h1>
        {user ? <UserMenu email={user.email} /> : null}
      </header>
      <Panel className="flex flex-col items-start gap-4 py-10">
        <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Study that sticks.
        </h2>
        <p className="text-lg text-ink-soft">
          A modern flashcard and learning platform.
        </p>
        <div className="mt-2 flex flex-wrap gap-3">
          {user ? (
            <TextLink href="/dashboard" variant="button">
              Dashboard
            </TextLink>
          ) : (
            <>
              <TextLink href="/register" variant="button">
                Create account
              </TextLink>
              <TextLink href="/login" variant="button">
                Log in
              </TextLink>
            </>
          )}
        </div>
      </Panel>
      {user ? null : (
        <div className="grid gap-3 sm:grid-cols-3">
          {features.map((feature) => (
            <Panel key={feature.title} className="flex flex-col gap-2">
              <feature.icon aria-hidden className="h-5 w-5 text-ink-soft" />
              <h3 className="font-medium">{feature.title}</h3>
              <p className="text-sm text-ink-soft">{feature.line}</p>
            </Panel>
          ))}
        </div>
      )}
    </main>
  );
}

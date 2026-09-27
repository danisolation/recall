import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Study — DANISOLATION Recall",
};

// STUDY-011 ships the route the start-study control navigates to; STUDY-012
// replaces this shell with the card-by-card study interaction.
export default async function StudySessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const id = Number(sessionId);

  // Malformed ids fold into the 404, mirroring the API's parseSessionId:
  // never send a non-integer downstream.
  if (!Number.isInteger(id)) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Study</h1>
      <section className="rounded-card border border-ink/10 bg-card p-4 shadow-[4px_4px_0_0] shadow-ink/15 sm:p-6">
        <p className="text-ink-soft">Session {id}</p>
      </section>
    </div>
  );
}

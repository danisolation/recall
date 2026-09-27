import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, History } from "lucide-react";
import { panelClassName } from "@/components/ui/panel";
import {
  getProgressSummary,
  listDueCards,
  listSessionHistory,
} from "@/lib/progress";

export const metadata: Metadata = {
  title: "Progress — DANISOLATION Recall",
};

// Fixed locale and zone keep the rendered dates identical on the server and
// during hydration, so the markup cannot mismatch.
const longDate = new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
  timeZone: "UTC",
});

// Display-only mapping of ADR-009's stored state tokens.
const statusLabels: Record<string, string> = {
  ACTIVE: "Active",
  COMPLETED: "Completed",
  ABANDONED: "Abandoned",
};

export default async function ProgressPage() {
  const [summary, due, history] = await Promise.all([
    getProgressSummary(),
    listDueCards(),
    listSessionHistory(),
  ]);

  // Counts-only API (ADR-010): accuracy is derived here, once, the same way
  // the study screen's completion view does it.
  const accuracy =
    summary.totalReviews === 0
      ? null
      : Math.round((summary.correctReviews / summary.totalReviews) * 100);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Progress</h1>

      <section className={panelClassName}>
        <h2 className="text-lg font-semibold">Summary</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1">
            <dt className="text-sm text-ink-soft">Reviews</dt>
            <dd className="font-medium">{summary.totalReviews}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-sm text-ink-soft">Accuracy</dt>
            <dd className="font-medium">
              {accuracy === null ? "No answers yet" : `${accuracy}%`}
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-sm text-ink-soft">Due cards</dt>
            <dd className="font-medium">{summary.dueCount}</dd>
          </div>
        </dl>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Due now</h2>
        {due.items.length === 0 ? (
          <section className={`${panelClassName} flex flex-col items-center gap-2 py-8 text-center`}>
            <CalendarCheck aria-hidden className="h-6 w-6 text-ink-soft" />
            <p className="text-ink-soft">Nothing is due right now.</p>
          </section>
        ) : (
          <ul className="flex flex-col gap-3">
            {due.items.map((card) => (
              <li key={card.cardId} className={panelClassName}>
                <Link href={`/sets/${card.setId}`} className="block">
                  <span className="block font-medium">{card.front}</span>
                  <span className="mt-1 block text-sm text-ink-soft">
                    {card.setTitle}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Recent sessions</h2>
        {history.items.length === 0 ? (
          <section className={`${panelClassName} flex flex-col items-center gap-2 py-8 text-center`}>
            <History aria-hidden className="h-6 w-6 text-ink-soft" />
            <p className="text-ink-soft">
              You have not studied anything yet.
            </p>
          </section>
        ) : (
          <ul className="flex flex-col gap-3">
            {history.items.map((session) => (
              <li key={session.id} className={panelClassName}>
                <Link href={`/sets/${session.setId}`} className="block">
                  <span className="block font-medium">{session.setTitle}</span>
                  <span className="mt-1 block text-sm text-ink-soft">
                    {`${statusLabels[session.status] ?? session.status} — ${longDate.format(new Date(session.startedAt))}`}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

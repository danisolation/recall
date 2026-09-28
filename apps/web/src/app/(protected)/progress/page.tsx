import type { Metadata } from "next";
import Link from "next/link";
import { AlarmClock, CalendarCheck, Flame, History, RotateCcw, Target, Trophy } from "lucide-react";
import { Panel, panelClassName } from "@/components/ui/panel";
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

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Summary</h2>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <Panel className="flex flex-col items-center gap-1 py-6 text-center">
            <RotateCcw aria-hidden className="h-5 w-5 text-ink-soft" />
            <p className="text-4xl font-semibold tracking-tight">
              {summary.totalReviews}
            </p>
            <p className="text-sm text-ink-soft">Reviews</p>
          </Panel>
          <Panel className="flex flex-col items-center gap-1 py-6 text-center">
            <Target aria-hidden className="h-5 w-5 text-ink-soft" />
            {accuracy === null ? (
              <p className="text-lg font-medium text-ink-soft">
                No answers yet
              </p>
            ) : (
              <p className="text-4xl font-semibold tracking-tight">
                {`${accuracy}%`}
              </p>
            )}
            <p className="text-sm text-ink-soft">Accuracy</p>
          </Panel>
          <Panel className="flex flex-col items-center gap-1 py-6 text-center">
            <AlarmClock aria-hidden className="h-5 w-5 text-ink-soft" />
            <p className="text-4xl font-semibold tracking-tight">
              {summary.dueCount}
            </p>
            <p className="text-sm text-ink-soft">Due cards</p>
          </Panel>
          {/* ADR-016: a streak is a count of days practiced, so 0 is an
              honest reading here — unlike accuracy, which has no meaning
              before the first answer. */}
          <Panel className="flex flex-col items-center gap-1 py-6 text-center">
            <Flame aria-hidden className="h-5 w-5 text-ink-soft" />
            <p className="text-4xl font-semibold tracking-tight">
              {summary.currentStreak}
            </p>
            <p className="text-sm text-ink-soft">Current streak</p>
          </Panel>
          <Panel className="flex flex-col items-center gap-1 py-6 text-center">
            <Trophy aria-hidden className="h-5 w-5 text-ink-soft" />
            <p className="text-4xl font-semibold tracking-tight">
              {summary.longestStreak}
            </p>
            <p className="text-sm text-ink-soft">Longest streak</p>
          </Panel>
        </div>
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
                  {/* The status dot is decorative; the full pinned string
                      stays this span's direct text so text queries match. */}
                  <span className="mt-1 inline-flex items-center gap-1.5 text-sm text-ink-soft">
                    <span
                      aria-hidden
                      className={`h-1.5 w-1.5 rounded-full ${
                        session.status === "ABANDONED"
                          ? "bg-alert"
                          : session.status === "ACTIVE"
                            ? "bg-marker-deep"
                            : "bg-ink/60"
                      }`}
                    />
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

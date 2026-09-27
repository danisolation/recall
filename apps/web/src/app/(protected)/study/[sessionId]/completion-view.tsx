import Link from "next/link";

const panel =
  "flex flex-col gap-4 rounded-card border border-ink/10 bg-card p-4 shadow-[4px_4px_0_0] shadow-ink/15 sm:p-6";

// Same link register as the set detail page's "Edit set" link.
const textLink =
  "rounded-sm font-medium underline underline-offset-4 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

// The summary the protected header cannot give: the session's §78 basics
// (reviewed count, accuracy) scoped to this session, plus the ways out.
// Accuracy comes straight from the binary reviews (ADR-009).
export function CompletionView({
  setId,
  status,
  reviews,
  totalCards,
}: {
  setId: number;
  status: string;
  reviews: { correct: boolean }[];
  totalCards: number;
}) {
  const reviewed = reviews.length;
  const correct = reviews.filter((review) => review.correct).length;
  const accuracy =
    reviewed === 0 ? null : Math.round((correct / reviewed) * 100);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        {status === "ABANDONED" ? "Session abandoned" : "Session complete"}
      </h1>
      <section className={panel}>
        <p className="text-sm text-ink-soft">
          {`${reviewed} of ${totalCards} answered`}
        </p>
        {reviewed === 0 ? (
          <p className="text-ink-soft">
            No answers were recorded in this session.
          </p>
        ) : (
          <p className="text-lg font-medium">
            {`${correct} of ${reviewed} correct (${accuracy}% accuracy)`}
          </p>
        )}
        <div className="flex flex-wrap gap-4">
          <Link href={`/sets/${setId}`} className={textLink}>
            Back to the set
          </Link>
          <Link href="/dashboard" className={textLink}>
            Back to the dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}

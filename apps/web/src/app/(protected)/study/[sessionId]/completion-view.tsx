import { ArrowLeft } from "lucide-react";
import { Panel } from "@/components/ui/panel";
import { TextLink } from "@/components/ui/text-link";

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
      <Panel className="flex flex-col gap-4">
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
          <TextLink href={`/sets/${setId}`}>
            <ArrowLeft aria-hidden className="h-4 w-4 shrink-0" />
            Back to the set
          </TextLink>
          <TextLink href="/dashboard">
            <ArrowLeft aria-hidden className="h-4 w-4 shrink-0" />
            Back to the dashboard
          </TextLink>
        </div>
      </Panel>
    </div>
  );
}

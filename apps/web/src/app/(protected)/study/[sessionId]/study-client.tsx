"use client";

import { useEffect, useState } from "react";
import { Check, Eye, Layers, X } from "lucide-react";
import {
  ApiError,
  finishSession,
  getSession,
  recordReview,
  type RecordedReview,
  type StudySessionView,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Panel } from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";
import { TextLink } from "@/components/ui/text-link";
import { CompletionView } from "./completion-view";

export function StudyClient({ sessionId }: { sessionId: number }) {
  const [data, setData] = useState<StudySessionView | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Cards that can never be answered in this session (deleted mid-session,
  // or the answer raced in): ADR-009 says they are skipped, not retried.
  const [skipped, setSkipped] = useState<number[]>([]);

  useEffect(() => {
    let active = true;

    getSession(sessionId)
      .then((result) => {
        if (active) {
          setData(result);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setLoadError(
            err instanceof ApiError
              ? err.message
              : "Loading the study session failed. Try again.",
          );
        }
      });

    return () => {
      active = false;
    };
  }, [sessionId]);

  // Completing the pass finishes the session (ADR-009: ACTIVE → COMPLETED).
  // The finish call is idempotent, so a retry or a StrictMode double-run is
  // a no-op; if it fails the summary stays and the next visit retries it.
  useEffect(() => {
    if (!data || data.session.status !== "ACTIVE" || data.cards.length === 0) {
      return;
    }

    const answeredIds = new Set([
      ...data.reviews.map((review) => review.cardId),
      ...skipped,
    ]);
    const hasRemaining = data.cards.some((card) => !answeredIds.has(card.id));

    if (hasRemaining) {
      return;
    }

    let active = true;

    finishSession(sessionId)
      .then(() => {
        if (active) {
          setData((prev) =>
            prev
              ? {
                  ...prev,
                  session: { ...prev.session, status: "COMPLETED" },
                }
              : prev,
          );
        }
      })
      .catch(() => {
        // The completion summary is already shown; the session is finished
        // on the next visit when this effect re-fires.
      });

    return () => {
      active = false;
    };
  }, [data, skipped, sessionId]);

  // Keyboard shortcuts (ADR-013): Space/Enter reveal, 1 = Incorrect,
  // 2 = Correct. Events from interactive elements are ignored so a focused
  // button's own activation never double-fires, and handled keys are
  // preventDefault-ed (Space would otherwise scroll the page).
  useEffect(() => {
    if (!data || data.session.status !== "ACTIVE") {
      return;
    }

    const session = data;

    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === "BUTTON" ||
          target.tagName === "A" ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      const answeredIds = new Set([
        ...session.reviews.map((review) => review.cardId),
        ...skipped,
      ]);
      const card = session.cards.find(
        (candidate) => !answeredIds.has(candidate.id),
      );

      if (!card) {
        return;
      }

      if (!revealed && (event.key === " " || event.key === "Enter")) {
        event.preventDefault();
        setRevealed(true);
        return;
      }

      if (
        revealed &&
        !isRecording &&
        (event.key === "1" || event.key === "2")
      ) {
        event.preventDefault();
        void answer(card.id, event.key === "2");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [data, skipped, revealed, isRecording]);

  async function answer(cardId: number, correct: boolean) {
    setIsRecording(true);
    setError(null);

    try {
      const review: RecordedReview = await recordReview(sessionId, {
        cardId,
        correct,
      });
      setData((prev) =>
        prev
          ? { ...prev, reviews: [...prev.reviews, review] }
          : prev,
      );
      setRevealed(false);
      setIsRecording(false);
    } catch (err) {
      setIsRecording(false);

      if (!(err instanceof ApiError)) {
        setError("Recording your answer failed. Try again.");
        return;
      }

      if (
        err.code === "CARD_NOT_FOUND" ||
        err.code === "REVIEW_ALREADY_RECORDED"
      ) {
        setSkipped((prev) => [...prev, cardId]);
        setRevealed(false);
      }

      setError(err.message);
    }
  }

  if (loadError) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-semibold tracking-tight">Study</h1>
        <Panel className="flex flex-col gap-4">
          <FieldError>{loadError}</FieldError>
        </Panel>
      </div>
    );
  }

  if (!data) {
    // §56: a shaped waiting state; the text moves to sr-only for screen
    // readers while the skeleton carries the visual.
    return (
      <div className="flex flex-col gap-6" aria-busy="true">
        <h1 className="text-2xl font-semibold tracking-tight">Study</h1>
        <Panel className="flex flex-col gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-11 w-36" />
        </Panel>
        <p className="sr-only">Loading…</p>
      </div>
    );
  }

  if (data.session.status !== "ACTIVE") {
    return (
      <CompletionView
        setId={data.session.setId}
        status={data.session.status}
        reviews={data.reviews}
        totalCards={data.cards.length}
      />
    );
  }

  if (data.cards.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-semibold tracking-tight">Study</h1>
        <Panel className="flex flex-col items-center gap-2 py-8 text-center">
          <Layers aria-hidden className="h-6 w-6 text-ink-soft" />
          <p className="text-ink-soft">This set has no cards to study yet.</p>
          <TextLink href={`/sets/${data.session.setId}`}>
            Back to the set
          </TextLink>
        </Panel>
      </div>
    );
  }

  // The progression is the session's own data: a card is current while it
  // has no review (or skip) recorded, so a resume and every advance come
  // from what the server confirmed, never from a local counter.
  const answeredIds = new Set([
    ...data.reviews.map((review) => review.cardId),
    ...skipped,
  ]);
  const current = data.cards.find((card) => !answeredIds.has(card.id));

  if (!current) {
    return (
      <CompletionView
        setId={data.session.setId}
        status={data.session.status}
        reviews={data.reviews}
        totalCards={data.cards.length}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Study</h1>
      <Panel className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-ink-soft">
            {`${data.reviews.length} of ${data.cards.length} answered`}
          </p>
          <div
            role="progressbar"
            aria-label="Session progress"
            aria-valuemin={0}
            aria-valuemax={data.cards.length}
            aria-valuenow={data.reviews.length}
            className="h-1.5 overflow-hidden rounded-full bg-muted"
          >
            <div
              className="h-full w-full origin-left rounded-full bg-marker transition-transform duration-200 motion-reduce:transition-none"
              style={{
                transform: `scaleX(${data.reviews.length / data.cards.length})`,
              }}
            />
          </div>
        </div>
        {/* Both faces stay mounted for the flip (ADR-013); the hidden face
            is removed from the accessibility tree via aria-hidden. */}
        <div className="flip-card" data-revealed={revealed || undefined}>
          <div className="flip-card-inner">
            <div
              aria-hidden={revealed || undefined}
              className="flip-card-face flex min-h-36 items-center rounded-card border-[3px] border-border bg-card p-4 shadow-clay"
            >
              <p className="text-xl font-medium">{current.front}</p>
            </div>
            <div
              aria-hidden={!revealed || undefined}
              className="flip-card-face flip-card-back flex min-h-36 items-center overflow-y-auto rounded-card border-[3px] border-border bg-card p-4 shadow-clay"
            >
              <p className="text-lg text-ink-soft">{current.back}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {revealed ? (
            <>
              <Button
                onClick={() => answer(current.id, true)}
                disabled={isRecording}
              >
                <Check aria-hidden className="h-4 w-4 shrink-0" />
                Correct
              </Button>
              <Button
                variant="secondary"
                onClick={() => answer(current.id, false)}
                disabled={isRecording}
              >
                <X aria-hidden className="h-4 w-4 shrink-0" />
                Incorrect
              </Button>
            </>
          ) : (
            <Button onClick={() => setRevealed(true)}>
              <Eye aria-hidden className="h-4 w-4 shrink-0" />
              Reveal answer
            </Button>
          )}
        </div>
        {error ? <FieldError>{error}</FieldError> : null}
      </Panel>
    </div>
  );
}

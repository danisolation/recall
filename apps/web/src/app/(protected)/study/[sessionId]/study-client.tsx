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
    return <p className="text-ink-soft">Loading…</p>;
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
        <p className="text-sm text-ink-soft">
          {`${data.reviews.length} of ${data.cards.length} answered`}
        </p>
        <div className="flex flex-col gap-2">
          <p className="text-lg font-medium">{current.front}</p>
          {revealed ? <p className="text-ink-soft">{current.back}</p> : null}
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

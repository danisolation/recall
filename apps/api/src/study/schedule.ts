// ADR-009: the scheduling ladder is a pure, isolated function so FSRS can
// later replace the body behind the same signature (§48) and tests pass
// `now` explicitly instead of reading system time (§49).

const LADDER_MINUTES = [10, 24 * 60, 3 * 24 * 60, 7 * 24 * 60] as const;

export type SchedulingState = { streak: number };

export type SchedulingResult = {
  streak: number;
  nextReviewAt: Date;
};

function minutesFromNow(minutes: number, now: Date): Date {
  return new Date(now.getTime() + minutes * 60_000);
}

export function schedule(
  state: SchedulingState,
  correct: boolean,
  now: Date,
): SchedulingResult {
  const [resetMinutes, oneDay, threeDays, sevenDays] = LADDER_MINUTES;

  if (!correct) {
    return { streak: 0, nextReviewAt: minutesFromNow(resetMinutes, now) };
  }

  const streak = state.streak + 1;
  const interval =
    streak >= 3 ? sevenDays : streak === 2 ? threeDays : oneDay;

  return { streak, nextReviewAt: minutesFromNow(interval, now) };
}

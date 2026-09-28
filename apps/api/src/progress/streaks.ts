// ADR-016: the daily streak is derived from the immutable `reviews`
// history rather than persisted, so this is a pure, isolated function
// tested with an explicit `today` instead of the system clock (§49).
// "Daily" means consecutive days practiced, not the per-card ladder
// streak that `user_card_progress.streak` holds (§46).
//
// `reviewDays` is the user's distinct practice days as UTC midnights;
// unsorted, duplicated, and future days are tolerated so the caller
// never has to pre-clean a query result.

const DAY_MS = 24 * 60 * 60_000;

export type DailyStreaks = {
  currentStreak: number;
  longestStreak: number;
};

export function computeDailyStreaks(
  reviewDays: readonly Date[],
  today: Date,
): DailyStreaks {
  if (reviewDays.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const todayUtc = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate(),
  );

  // Distinct UTC day numbers, ascending, future days dropped: a clock
  // skew or a `today` behind a recorded review must not invent a streak.
  const days = [
    ...new Set(
      reviewDays.map((day) => {
        const utc = Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate());
        return utc <= todayUtc ? utc : Number.NaN;
      }),
    ),
  ]
    .filter((utc) => !Number.isNaN(utc))
    .sort((a, b) => a - b);

  let longestStreak = 0;
  let run = 0;
  let previous: number | undefined;

  for (const utc of days) {
    run = previous !== undefined && utc - previous === DAY_MS ? run + 1 : 1;
    previous = utc;
    if (run > longestStreak) {
      longestStreak = run;
    }
  }

  // The grace rule: a run ending yesterday is still current — showing 0
  // on a morning with no activity yet would misdescribe the habit.
  const last = days[days.length - 1];
  const currentStreak =
    last === todayUtc || last === todayUtc - DAY_MS ? run : 0;

  return { currentStreak, longestStreak };
}

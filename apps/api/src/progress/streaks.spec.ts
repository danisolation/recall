import { describe, expect, it } from "vitest";
import { computeDailyStreaks } from "./streaks";

const today = new Date("2026-09-26T00:00:00.000Z");

// A practice day, as the repository reports it: UTC midnight.
const day = (iso: string): Date => new Date(`${iso}T00:00:00.000Z`);

describe("computeDailyStreaks", () => {
  it("reports no streaks for an empty history", () => {
    expect(computeDailyStreaks([], today)).toEqual({
      currentStreak: 0,
      longestStreak: 0,
    });
  });

  it("counts a single day practiced today as a streak of one", () => {
    expect(computeDailyStreaks([day("2026-09-26")], today)).toEqual({
      currentStreak: 1,
      longestStreak: 1,
    });
  });

  it("keeps a yesterday-ending streak current (the grace rule)", () => {
    expect(computeDailyStreaks([day("2026-09-25")], today)).toEqual({
      currentStreak: 1,
      longestStreak: 1,
    });
  });

  it("counts a run ending yesterday without double-counting today", () => {
    const days = [day("2026-09-23"), day("2026-09-24"), day("2026-09-25")];

    expect(computeDailyStreaks(days, today)).toEqual({
      currentStreak: 3,
      longestStreak: 3,
    });
  });

  it("ends a streak that last practiced before yesterday", () => {
    expect(computeDailyStreaks([day("2026-09-22")], today)).toEqual({
      currentStreak: 0,
      longestStreak: 1,
    });
  });

  it("counts a single long run of seven consecutive days", () => {
    const days = [
      day("2026-09-20"),
      day("2026-09-21"),
      day("2026-09-22"),
      day("2026-09-23"),
      day("2026-09-24"),
      day("2026-09-25"),
      day("2026-09-26"),
    ];

    expect(computeDailyStreaks(days, today)).toEqual({
      currentStreak: 7,
      longestStreak: 7,
    });
  });

  it("breaks the current streak at a gap but keeps the longer run behind it", () => {
    const days = [
      day("2026-09-16"),
      day("2026-09-17"),
      day("2026-09-18"),
      day("2026-09-19"),
      day("2026-09-20"),
      day("2026-09-24"),
      day("2026-09-25"),
      day("2026-09-26"),
    ];

    expect(computeDailyStreaks(days, today)).toEqual({
      currentStreak: 3,
      longestStreak: 5,
    });
  });

  it("counts consecutive days across a month boundary", () => {
    const endOfMonth = new Date("2026-02-01T00:00:00.000Z");
    const days = [day("2026-01-30"), day("2026-01-31"), day("2026-02-01")];

    expect(computeDailyStreaks(days, endOfMonth)).toEqual({
      currentStreak: 3,
      longestStreak: 3,
    });
  });

  it("counts consecutive days across a year boundary", () => {
    const newYear = new Date("2026-01-01T00:00:00.000Z");
    const days = [day("2025-12-30"), day("2025-12-31"), day("2026-01-01")];

    expect(computeDailyStreaks(days, newYear)).toEqual({
      currentStreak: 3,
      longestStreak: 3,
    });
  });

  it("accepts practice days in any order", () => {
    const days = [day("2026-09-26"), day("2026-09-24"), day("2026-09-25")];

    expect(computeDailyStreaks(days, today)).toEqual({
      currentStreak: 3,
      longestStreak: 3,
    });
  });

  it("ignores practice days in the future", () => {
    const days = [
      day("2026-09-25"),
      day("2026-09-26"),
      day("2026-09-27"),
    ];

    expect(computeDailyStreaks(days, today)).toEqual({
      currentStreak: 2,
      longestStreak: 2,
    });
  });

  it("does not mutate the given days", () => {
    const days = [day("2026-09-26"), day("2026-09-24")];

    computeDailyStreaks(days, today);

    expect(days.map((d) => d.toISOString())).toEqual([
      "2026-09-26T00:00:00.000Z",
      "2026-09-24T00:00:00.000Z",
    ]);
  });
});

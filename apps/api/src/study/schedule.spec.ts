import { describe, expect, it } from "vitest";
import { schedule } from "./schedule";

const now = new Date("2026-09-26T12:00:00.000Z");

const minute = 60_000;
const day = 24 * 60 * minute;

describe("schedule", () => {
  it("resets the streak and schedules 10 minutes out for an incorrect answer", () => {
    const result = schedule({ streak: 2 }, false, now);

    expect(result.streak).toBe(0);
    expect(result.nextReviewAt.getTime()).toBe(now.getTime() + 10 * minute);
  });

  it("schedules a first correct answer 1 day out", () => {
    const result = schedule({ streak: 0 }, true, now);

    expect(result.streak).toBe(1);
    expect(result.nextReviewAt.getTime()).toBe(now.getTime() + day);
  });

  it("schedules a second consecutive correct answer 3 days out", () => {
    const result = schedule({ streak: 1 }, true, now);

    expect(result.streak).toBe(2);
    expect(result.nextReviewAt.getTime()).toBe(now.getTime() + 3 * day);
  });

  it("caps the interval at 7 days for later streaks", () => {
    const third = schedule({ streak: 2 }, true, now);

    expect(third.streak).toBe(3);
    expect(third.nextReviewAt.getTime()).toBe(now.getTime() + 7 * day);

    const tenth = schedule({ streak: 9 }, true, now);

    expect(tenth.streak).toBe(10);
    expect(tenth.nextReviewAt.getTime()).toBe(now.getTime() + 7 * day);
  });

  it("does not mutate the given progress", () => {
    const state = { streak: 2 };

    schedule(state, true, now);

    expect(state.streak).toBe(2);
  });
});

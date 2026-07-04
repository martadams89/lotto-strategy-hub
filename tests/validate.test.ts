import { describe, it, expect } from "vitest";
import { GAMES } from "../src/lib/games";
import { validateDraw, sanitiseDraws } from "../src/lib/validate";

const lotto = GAMES.lotto;
const euro = GAMES.euromillions;

describe("validateDraw", () => {
  it("accepts a valid lotto draw", () => {
    expect(validateDraw({ date: "2024-01-06", numbers: [5, 12, 19, 33, 44, 58], stars: [], bonus: 8 }, lotto).ok).toBe(true);
  });

  it("accepts a valid euromillions draw", () => {
    expect(validateDraw({ date: "2024-01-05", numbers: [11, 15, 28, 41, 49], stars: [5, 9] }, euro).ok).toBe(true);
  });

  it("rejects the wrong number of main balls (the real corruption we found)", () => {
    const bad = { date: "2026-07-01", numbers: [5, 8, 13, 26, 33, 33, 35, 39, 40, 42, 43, 54], stars: [], bonus: 56 };
    expect(validateDraw(bad, lotto).ok).toBe(false);
  });

  it("rejects duplicate main balls", () => {
    expect(validateDraw({ date: "2024-01-06", numbers: [5, 5, 19, 33, 44, 58], stars: [] }, lotto).ok).toBe(false);
  });

  it("rejects out-of-range balls", () => {
    expect(validateDraw({ date: "2024-01-06", numbers: [5, 12, 19, 33, 44, 60], stars: [] }, lotto).ok).toBe(false);
    expect(validateDraw({ date: "2024-01-06", numbers: [0, 12, 19, 33, 44, 58], stars: [] }, lotto).ok).toBe(false);
  });

  it("rejects a bad date", () => {
    expect(validateDraw({ date: "01-06-2024", numbers: [5, 12, 19, 33, 44, 58], stars: [] }, lotto).ok).toBe(false);
    expect(validateDraw({ date: "not-a-date", numbers: [5, 12, 19, 33, 44, 58], stars: [] }, lotto).ok).toBe(false);
  });

  it("rejects euromillions with wrong star count or range", () => {
    expect(validateDraw({ date: "2024-01-05", numbers: [11, 15, 28, 41, 49], stars: [5] }, euro).ok).toBe(false);
    expect(validateDraw({ date: "2024-01-05", numbers: [11, 15, 28, 41, 49], stars: [5, 13] }, euro).ok).toBe(false);
  });

  it("rejects a bonus ball that duplicates a main ball", () => {
    expect(validateDraw({ date: "2024-01-06", numbers: [5, 12, 19, 33, 44, 58], stars: [], bonus: 44 }, lotto).ok).toBe(false);
  });
});

describe("sanitiseDraws", () => {
  it("drops invalid rows, sorts newest-first, and de-duplicates by date", () => {
    const input = [
      { date: "2024-01-06", numbers: [58, 5, 12, 19, 33, 44], stars: [], bonus: 8 },
      { date: "2026-07-01", numbers: [5, 8, 13, 26, 33, 33, 35, 39, 40, 42, 43, 54], stars: [] }, // corrupt
      { date: "2024-01-10", numbers: [1, 2, 3, 4, 5, 6], stars: [] },
      { date: "2024-01-10", numbers: [1, 2, 3, 4, 5, 6], stars: [] }, // duplicate date
    ];
    const { clean, dropped } = sanitiseDraws(input, lotto);
    expect(dropped.length).toBe(1);
    expect(clean.length).toBe(2);
    expect(clean[0].date).toBe("2024-01-10"); // newest first
    expect(clean[1].numbers).toEqual([5, 12, 19, 33, 44, 58]); // sorted ascending
  });
});

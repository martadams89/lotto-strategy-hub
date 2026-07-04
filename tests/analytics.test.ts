import { describe, it, expect } from "vitest";
import { GAMES, Draw } from "../src/lib/games";
import { analyse } from "../src/lib/analytics";

const fixture: Draw[] = [
  { date: "2024-01-01", numbers: [1, 2, 3, 4, 5, 6], stars: [] },
  { date: "2024-01-03", numbers: [1, 2, 3, 4, 5, 7], stars: [] },
  { date: "2024-01-06", numbers: [1, 2, 3, 8, 9, 10], stars: [] },
];

describe("analyse", () => {
  const a = analyse(fixture, GAMES.lotto);

  it("counts draws and the date range", () => {
    expect(a.totalDraws).toBe(3);
    expect(a.firstDate).toBe("2024-01-01");
    expect(a.lastDate).toBe("2024-01-06");
  });

  it("computes per-number frequency", () => {
    const one = a.main.find((s) => s.n === 1)!;
    const seven = a.main.find((s) => s.n === 7)!;
    expect(one.count).toBe(3);
    expect(seven.count).toBe(1);
    const eleven = a.main.find((s) => s.n === 11)!;
    expect(eleven.count).toBe(0); // never drawn
  });

  it("computes the mean line sum", () => {
    // sums: 21, 22, 33 -> mean 25.33 -> rounds to 25
    expect(a.sum.mean).toBe(25);
    expect(a.sum.min).toBe(21);
    expect(a.sum.max).toBe(33);
  });

  it("reports the birthday-zone average (all balls <= 31 here)", () => {
    expect(a.birthdayZoneAvg).toBeCloseTo(6, 5);
  });

  it("lists hottest numbers by frequency", () => {
    expect(a.hottest.slice(0, 3).sort((x, y) => x - y)).toEqual([1, 2, 3]);
  });
});

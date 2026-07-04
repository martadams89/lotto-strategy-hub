import { describe, it, expect } from "vitest";
import { GAMES, GameConfig } from "../src/lib/games";
import { sumStats, scoreLine, generateLine, generateTickets } from "../src/lib/strategy";
import { seededRng } from "../src/lib/rng";

const games: GameConfig[] = [GAMES.lotto, GAMES.euromillions];

describe("sumStats (from first principles)", () => {
  it("matches the exact mean for each game", () => {
    expect(sumStats(6, 59).mean).toBe(180); // UK Lotto
    expect(sumStats(5, 50).mean).toBe(127.5); // EuroMillions
  });
  it("matches the expected standard deviation", () => {
    expect(sumStats(6, 59).sd).toBeCloseTo(39.87, 1);
    expect(sumStats(5, 50).sd).toBeCloseTo(30.92, 1);
  });
});

describe("scoreLine rarity", () => {
  it("rates a crowded all-birthday line far below an uncrowded one", () => {
    const crowded = scoreLine([3, 7, 11, 17, 23, 31], GAMES.lotto).rarity;
    const uncrowded = scoreLine([4, 17, 29, 38, 44, 52], GAMES.lotto).rarity;
    expect(crowded).toBeLessThan(uncrowded);
    expect(crowded).toBeLessThan(25);
    expect(uncrowded).toBeGreaterThan(45);
  });

  it("penalises an obvious arithmetic sequence", () => {
    const arithmetic = scoreLine([5, 10, 15, 20, 25, 30], GAMES.lotto).rarity;
    const scattered = scoreLine([5, 11, 18, 26, 37, 44], GAMES.lotto).rarity;
    expect(arithmetic).toBeLessThan(scattered);
  });
});

describe("generateLine / generateTickets", () => {
  for (const game of games) {
    it(`${game.name}: produces structurally valid lines`, () => {
      const t = generateLine(game, seededRng("seed-1"));
      expect(t.numbers.length).toBe(game.mainCount);
      expect(new Set(t.numbers).size).toBe(game.mainCount);
      expect([...t.numbers]).toEqual([...t.numbers].sort((a, b) => a - b));
      for (const n of t.numbers) {
        expect(n).toBeGreaterThanOrEqual(1);
        expect(n).toBeLessThanOrEqual(game.mainMax);
      }
      expect(t.stars.length).toBe(game.starCount);
      for (const s of t.stars) {
        expect(s).toBeGreaterThanOrEqual(1);
        expect(s).toBeLessThanOrEqual(game.starMax);
      }
    });

    it(`${game.name}: is deterministic for a given seed`, () => {
      const a = generateTickets(game, "visitor-xyz", 3);
      const b = generateTickets(game, "visitor-xyz", 3);
      expect(a).toEqual(b);
    });

    it(`${game.name}: different seeds give different numbers (per-visitor uniqueness)`, () => {
      const a = generateTickets(game, "visitor-A", 1)[0].numbers.join(",");
      const b = generateTickets(game, "visitor-B", 1)[0].numbers.join(",");
      expect(a).not.toBe(b);
    });

    it(`${game.name}: returns the requested number of distinct lines`, () => {
      const tickets = generateTickets(game, "distinct-seed", 5);
      expect(tickets.length).toBe(5);
      const keys = tickets.map((t) => `${t.numbers.join(",")}|${t.stars.join(",")}`);
      expect(new Set(keys).size).toBe(5);
    });

    it(`${game.name}: generated lines are reasonably uncrowded`, () => {
      const tickets = generateTickets(game, "quality-seed", 6);
      const avg = tickets.reduce((a, t) => a + t.score.rarity, 0) / tickets.length;
      expect(avg).toBeGreaterThan(60);
    });
  }
});

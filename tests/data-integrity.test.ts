import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { GAMES, GameConfig, Draw } from "../src/lib/games";
import { validateDraw } from "../src/lib/validate";

/**
 * This is the safety gate. It reads the ACTUAL shipped datasets and asserts
 * every single row is well-formed. If the scraper ever writes garbage again
 * (like the 12-ball draw we found), this test fails and the change is blocked
 * from merging. Do not weaken it.
 */
function loadDataset(game: GameConfig): Draw[] {
  const file = path.join(process.cwd(), "public", "data", `${game.key}.json`);
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

describe.each(Object.values(GAMES))("$name dataset", (game: GameConfig) => {
  const draws = loadDataset(game);

  it("has a healthy number of historical draws", () => {
    expect(draws.length).toBeGreaterThan(1000);
  });

  it("has no invalid rows", () => {
    const bad = draws
      .map((d) => ({ d, r: validateDraw(d, game) }))
      .filter((x) => !x.r.ok)
      .map((x) => `${x.d.date}: ${x.r.reason}`);
    expect(bad).toEqual([]);
  });

  it("is sorted newest-first with unique dates", () => {
    const dates = draws.map((d) => d.date);
    expect(new Set(dates).size).toBe(dates.length);
    const sorted = [...dates].sort((a, b) => b.localeCompare(a));
    expect(dates).toEqual(sorted);
  });

  it("never stores fabricated prize fields", () => {
    for (const d of draws as unknown as Record<string, unknown>[]) {
      expect(d.winners).toBeUndefined();
      expect(d.jackpotAmount).toBeUndefined();
      expect(d.hasJackpotWinner).toBeUndefined();
    }
  });
});

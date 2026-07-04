// -----------------------------------------------------------------------------
// Draw validation.
//
// The single most important safety net in the whole project: nothing malformed
// should ever reach the UI. This same function guards the scraper (so garbage
// can't be committed) and is exercised by the test suite.
// -----------------------------------------------------------------------------

import { Draw, GameConfig } from "./games";

export interface ValidationResult {
  ok: boolean;
  reason?: string;
}

function isDistinctInRange(values: number[], count: number, max: number): ValidationResult {
  if (!Array.isArray(values)) return { ok: false, reason: "not an array" };
  if (values.length !== count) {
    return { ok: false, reason: `expected ${count} values, got ${values.length}` };
  }
  const seen = new Set<number>();
  for (const v of values) {
    if (!Number.isInteger(v)) return { ok: false, reason: `non-integer value ${v}` };
    if (v < 1 || v > max) return { ok: false, reason: `value ${v} out of range 1..${max}` };
    if (seen.has(v)) return { ok: false, reason: `duplicate value ${v}` };
    seen.add(v);
  }
  return { ok: true };
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Returns whether a draw is structurally valid for the given game. */
export function validateDraw(draw: Draw, game: GameConfig): ValidationResult {
  if (!draw || typeof draw !== "object") return { ok: false, reason: "not an object" };
  if (typeof draw.date !== "string" || !ISO_DATE.test(draw.date)) {
    return { ok: false, reason: `bad date "${draw.date}"` };
  }
  if (Number.isNaN(Date.parse(draw.date))) {
    return { ok: false, reason: `unparseable date "${draw.date}"` };
  }

  const main = isDistinctInRange(draw.numbers, game.mainCount, game.mainMax);
  if (!main.ok) return { ok: false, reason: `main balls: ${main.reason}` };

  if (game.starCount > 0) {
    const stars = isDistinctInRange(draw.stars ?? [], game.starCount, game.starMax);
    if (!stars.ok) return { ok: false, reason: `stars: ${stars.reason}` };
  }

  if (game.hasBonus && draw.bonus !== undefined) {
    if (!Number.isInteger(draw.bonus) || draw.bonus < 1 || draw.bonus > game.mainMax) {
      return { ok: false, reason: `bonus ${draw.bonus} out of range` };
    }
    if (draw.numbers.includes(draw.bonus)) {
      return { ok: false, reason: `bonus ${draw.bonus} duplicates a main ball` };
    }
  }

  return { ok: true };
}

/** Keep only valid draws, sorted newest-first, de-duplicated by date. */
export function sanitiseDraws(draws: Draw[], game: GameConfig): { clean: Draw[]; dropped: Draw[] } {
  const clean: Draw[] = [];
  const dropped: Draw[] = [];
  const byDate = new Map<string, Draw>();

  for (const d of draws) {
    if (validateDraw(d, game).ok) {
      byDate.set(d.date, {
        date: d.date,
        numbers: [...d.numbers].sort((a, b) => a - b),
        stars: [...(d.stars ?? [])].sort((a, b) => a - b),
        ...(d.bonus !== undefined ? { bonus: d.bonus } : {}),
      });
    } else {
      dropped.push(d);
    }
  }

  for (const d of byDate.values()) clean.push(d);
  clean.sort((a, b) => b.date.localeCompare(a.date));
  return { clean, dropped };
}

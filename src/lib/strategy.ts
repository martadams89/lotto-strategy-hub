// -----------------------------------------------------------------------------
// The one honest edge: play numbers other people don't.
//
// You cannot improve your odds of WINNING a fair lottery — they are fixed. But
// the jackpot is SHARED between everyone who matches it. Most players cluster on
// the same numbers (birthdays 1–31, "lucky" 7, neat patterns), so a winning
// ticket built from those numbers is more likely to be split many ways.
//
// This module estimates how "crowded" a line of numbers is and generates lines
// that steer away from the crowd. To be clear about what this does and doesn't
// do:
//   • It does NOT change your probability of winning.
//   • It aims to raise your EXPECTED PAYOUT *given that you win*, by making a
//     shared jackpot less likely.
//   • The popularity weights are informed estimates of human behaviour, not
//     measured truth. We're honest about that in the UI.
// -----------------------------------------------------------------------------

import { GameConfig } from "./games";
import { Rng, seededRng, weightedSample } from "./rng";

// --- Human popularity model -------------------------------------------------

const LUCKY_MAIN: Record<number, number> = {
  7: 1.0, // by far the most-chosen "lucky" number
  3: 0.4,
  5: 0.3,
  9: 0.35,
  11: 0.4,
  21: 0.3,
  23: 0.3,
  1: 0.3,
};

const AVOIDED_MAIN: Record<number, number> = {
  13: 0.4, // widely treated as unlucky, so under-picked (good for us)
};

const LUCKY_STAR: Record<number, number> = {
  7: 0.8,
  8: 0.5,
  2: 0.4,
  3: 0.4,
  5: 0.3,
};

/**
 * Estimated relative popularity for each main number (higher = picked by more
 * people = more crowded). Values are unitless weights around ~1.
 */
export function mainPopularity(game: GameConfig): number[] {
  const w = new Array(game.mainMax + 1).fill(0);
  for (let n = 1; n <= game.mainMax; n++) {
    let x = 1.0;
    if (n <= 31) x += 1.5; // calendar-day bias — the dominant effect
    if (n <= 12) x += 0.6; // also valid as a month
    if (n <= 9) x += 0.3; // very low single digits
    x += LUCKY_MAIN[n] ?? 0;
    x -= AVOIDED_MAIN[n] ?? 0;
    if (n > 31) x -= 0.35; // the under-played high zone
    w[n] = Math.max(0.15, x);
  }
  return w;
}

export function starPopularity(game: GameConfig): number[] {
  const w = new Array(game.starMax + 1).fill(0);
  for (let n = 1; n <= game.starMax; n++) {
    let x = 1.0;
    if (n <= 9) x += 0.3;
    x += LUCKY_STAR[n] ?? 0;
    if (n >= 10) x -= 0.2;
    w[n] = Math.max(0.2, x);
  }
  return w;
}

// --- Sum band from first principles (no historical file needed) -------------

/**
 * Exact mean and standard deviation of the sum of `k` distinct balls drawn
 * uniformly from 1..N. This is what pure chance produces — we aim our
 * generated lines at the centre of it so they look natural.
 */
export function sumStats(k: number, N: number): { mean: number; sd: number } {
  const mean = (k * (N + 1)) / 2;
  const variance = (k * (N + 1) * (N - k)) / 12;
  return { mean, sd: Math.sqrt(variance) };
}

// --- Scoring ----------------------------------------------------------------

export interface LineScore {
  /** 0–100. Higher = fewer people likely share this line. An estimate. */
  rarity: number;
  sum: number;
  oddCount: number;
  /** How many of the balls fall in the 1–31 "birthday" zone */
  birthdayZone: number;
  /** Distinct tens-bands the line spans */
  bandSpread: number;
}

function countConsecutive(sorted: number[]): number {
  let c = 0;
  for (let i = 1; i < sorted.length; i++) if (sorted[i] - sorted[i - 1] === 1) c++;
  return c;
}

function isArithmetic(sorted: number[]): boolean {
  if (sorted.length < 3) return false;
  const d = sorted[1] - sorted[0];
  for (let i = 2; i < sorted.length; i++) if (sorted[i] - sorted[i - 1] !== d) return false;
  return true;
}

/** Score a full main line for crowd-rarity plus structural red flags. */
export function scoreLine(numbers: number[], game: GameConfig): LineScore {
  const sorted = [...numbers].sort((a, b) => a - b);
  const pop = mainPopularity(game);
  const avgPop = sorted.reduce((a, n) => a + pop[n], 0) / sorted.length;

  // avgPop ~1 is neutral; the crowded birthday zone pushes it well above 2.
  let rarity = 100 - (avgPop - 0.65) * 42;

  const birthdayZone = sorted.filter((n) => n <= 31).length;
  const bands = new Set(sorted.map((n) => Math.floor((n - 1) / 10)));
  const consecutive = countConsecutive(sorted);

  if (isArithmetic(sorted)) rarity -= 28; // 5,10,15,20… kind of tickets
  if (birthdayZone === sorted.length) rarity -= 14; // everything in the birthday zone
  if (birthdayZone === 0 && sorted[0] > 24) rarity -= 10; // "all high" is also a pattern
  if (bands.size <= 1) rarity -= 12; // all clustered in one decade
  rarity -= Math.max(0, consecutive - 1) * 6; // long runs look picked

  const sum = sorted.reduce((a, n) => a + n, 0);
  const oddCount = sorted.filter((n) => n % 2 === 1).length;

  return {
    rarity: Math.max(1, Math.min(100, Math.round(rarity))),
    sum,
    oddCount,
    birthdayZone,
    bandSpread: bands.size,
  };
}

// --- Generation -------------------------------------------------------------

export interface Ticket {
  numbers: number[];
  stars: number[];
  score: LineScore;
}

/**
 * Rewards a line for looking like a *natural* draw: sum near the centre of what
 * chance produces, one or two (not zero, not five) birthday-zone numbers, a
 * balanced odd/even split, and a spread across bands. This is what stops the
 * generator from just spitting out "all high numbers", which dodges the crowd
 * but looks artificial and is its own kind of pattern.
 */
function shapeBonus(numbers: number[], game: GameConfig): number {
  const sorted = [...numbers].sort((a, b) => a - b);
  const { mean, sd } = sumStats(game.mainCount, game.mainMax);
  const sum = sorted.reduce((a, n) => a + n, 0);
  const oddCount = sorted.filter((n) => n % 2 === 1).length;
  const bands = new Set(sorted.map((n) => Math.floor((n - 1) / 10))).size;
  const birthdayZone = sorted.filter((n) => n <= 31).length;

  let bonus = 0;

  // Sum near the natural centre.
  const z = Math.abs(sum - mean) / sd;
  if (z <= 0.6) bonus += 16;
  else if (z <= 1) bonus += 10;
  else if (z <= 1.5) bonus += 3;
  else bonus -= 6;

  // A believable line usually carries one or two low numbers.
  if (birthdayZone === 1 || birthdayZone === 2) bonus += 10;
  else if (birthdayZone === 0 || birthdayZone === 3) bonus += 2;
  else bonus -= 4;

  // Balanced odd/even.
  if (Math.abs(oddCount - game.mainCount / 2) <= 1) bonus += 6;

  // Spread across several decades.
  bonus += Math.min(6, (bands - 1) * 2);
  return bonus;
}

/**
 * Generate one uncrowded, natural-looking line deterministically from an rng.
 * We draw several candidates that lean away from popular numbers, then keep the
 * best by (rarity + realism), so the line dodges the crowd while still looking
 * like a plausible ticket.
 */
export function generateLine(game: GameConfig, rng: Rng, candidates = 40): Ticket {
  const numbersPool = Array.from({ length: game.mainMax }, (_, i) => i + 1);
  const pop = mainPopularity(game);
  // Lean away from popular numbers, but gently (^0.7) so lines still look
  // natural instead of collapsing onto "all high numbers".
  const invWeights = numbersPool.map((n) => Math.pow(1 / pop[n], 0.7));

  let best: Ticket | null = null;
  let bestScore = -Infinity;

  for (let c = 0; c < candidates; c++) {
    const numbers = weightedSample(rng, numbersPool, invWeights, game.mainCount).sort(
      (a, b) => a - b,
    );
    const score = scoreLine(numbers, game);
    const composite = score.rarity + shapeBonus(numbers, game);
    if (composite > bestScore) {
      bestScore = composite;
      best = { numbers, stars: [], score };
    }
  }

  const ticket = best!;

  if (game.starCount > 0) {
    const starPool = Array.from({ length: game.starMax }, (_, i) => i + 1);
    const sPop = starPopularity(game);
    const sInv = starPool.map((n) => 1 / sPop[n]);
    ticket.stars = weightedSample(rng, starPool, sInv, game.starCount).sort((a, b) => a - b);
  }

  return ticket;
}

/**
 * Generate `n` distinct lines deterministically from a string seed. Same seed
 * ⇒ same lines, which is how "your numbers" stay yours.
 */
export function generateTickets(game: GameConfig, seed: string, n: number): Ticket[] {
  const out: Ticket[] = [];
  const seen = new Set<string>();
  let salt = 0;
  while (out.length < n && salt < n * 12) {
    const rng = seededRng(`${seed}::${game.key}::${salt++}`);
    const t = generateLine(game, rng);
    const key = `${t.numbers.join(",")}|${t.stars.join(",")}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(t);
    }
  }
  return out;
}

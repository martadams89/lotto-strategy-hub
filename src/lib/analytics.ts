// -----------------------------------------------------------------------------
// Descriptive analytics.
//
// IMPORTANT FRAMING: everything here describes what HAS happened. None of it
// predicts what WILL happen. In a fair draw every number is equally likely
// every time, regardless of how "hot", "cold" or "overdue" it looks. We expose
// these numbers because they're interesting and because comparing them to the
// flat line of pure chance is itself the honest lesson.
// -----------------------------------------------------------------------------

import { Draw, GameConfig } from "./games";

export interface NumberStat {
  n: number;
  count: number;
  /** Draws since this number last appeared (0 = most recent draw) */
  gap: number;
  /** Observed share of draws containing n, as a percentage */
  pct: number;
}

export interface GameAnalytics {
  totalDraws: number;
  firstDate: string;
  lastDate: string;
  main: NumberStat[];
  stars: NumberStat[];
  /** Share of draws each number "should" appear in if the draw were flat */
  expectedPct: number;
  sum: { mean: number; sd: number; min: number; max: number };
  oddShare: number; // average % of a line that is odd
  /** Average count of balls <= 31 (the "birthday zone") per line */
  birthdayZoneAvg: number;
  hottest: number[];
  coldest: number[];
}

function statsFor(
  draws: Draw[],
  pick: (d: Draw) => number[],
  max: number,
  perLine: number,
): NumberStat[] {
  const count = new Array(max + 1).fill(0);
  const lastSeen = new Array(max + 1).fill(-1);
  draws.forEach((d, idx) => {
    for (const n of pick(d)) {
      if (n >= 1 && n <= max) {
        count[n]++;
        if (lastSeen[n] === -1) lastSeen[n] = idx;
      }
    }
  });
  const total = draws.length || 1;
  const out: NumberStat[] = [];
  for (let n = 1; n <= max; n++) {
    out.push({
      n,
      count: count[n],
      gap: lastSeen[n] === -1 ? draws.length : lastSeen[n],
      pct: (count[n] / total) * 100,
    });
  }
  return out;
}

export function analyse(draws: Draw[], game: GameConfig): GameAnalytics {
  const sorted = [...draws].sort((a, b) => b.date.localeCompare(a.date));
  const total = sorted.length;

  const main = statsFor(sorted, (d) => d.numbers, game.mainMax, game.mainCount);
  const stars =
    game.starCount > 0 ? statsFor(sorted, (d) => d.stars ?? [], game.starMax, game.starCount) : [];

  let sumAcc = 0;
  const sums: number[] = [];
  let oddAcc = 0;
  let birthdayAcc = 0;
  for (const d of sorted) {
    let s = 0;
    for (const n of d.numbers) {
      s += n;
      if (n % 2 === 1) oddAcc++;
      if (n <= 31) birthdayAcc++;
    }
    sums.push(s);
    sumAcc += s;
  }
  const mean = total ? sumAcc / total : 0;
  const variance = total ? sums.reduce((a, s) => a + (s - mean) ** 2, 0) / total : 0;

  const byFreq = [...main].sort((a, b) => b.count - a.count);

  return {
    totalDraws: total,
    firstDate: sorted[total - 1]?.date ?? "",
    lastDate: sorted[0]?.date ?? "",
    main,
    stars,
    expectedPct: (game.mainCount / game.mainMax) * 100,
    sum: {
      mean: Math.round(mean),
      sd: Math.round(Math.sqrt(variance)),
      min: sums.length ? Math.min(...sums) : 0,
      max: sums.length ? Math.max(...sums) : 0,
    },
    oddShare: total ? (oddAcc / (total * game.mainCount)) * 100 : 0,
    birthdayZoneAvg: total ? birthdayAcc / total : 0,
    hottest: byFreq.slice(0, 6).map((s) => s.n),
    coldest: byFreq.slice(-6).reverse().map((s) => s.n),
  };
}

// -----------------------------------------------------------------------------
// Draw-day awareness.
//
// EuroMillions is drawn Tuesday & Friday; UK Lotto is drawn Wednesday &
// Saturday. Given "today" we work out the next draw for each game so the UI can
// put the most relevant one front and centre.
// -----------------------------------------------------------------------------

import { GameConfig, GameKey, GAMES, Weekday } from "./games";

const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export interface NextDraw {
  game: GameKey;
  /** ISO date of the next (or today's) draw */
  date: string;
  weekday: Weekday;
  weekdayName: string;
  /** Whole days from `today` until the draw (0 === today) */
  daysUntil: number;
  isToday: boolean;
}

/** Normalise any Date to a UTC midnight timestamp so day maths is stable. */
function utcMidnight(d: Date): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function toISO(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/**
 * The next draw for a game at or after `today`. If today is a draw day the
 * draw returned is today's (daysUntil 0).
 */
export function nextDrawFor(game: GameConfig, today: Date = new Date()): NextDraw {
  const base = utcMidnight(today);
  const todayDow = new Date(base).getUTCDay();

  let best = Infinity;
  for (const dow of game.drawDays) {
    let delta = (dow - todayDow + 7) % 7; // 0..6
    if (delta < best) best = delta;
  }

  const drawMs = base + best * 86400000;
  const weekday = new Date(drawMs).getUTCDay() as Weekday;
  return {
    game: game.key,
    date: toISO(drawMs),
    weekday,
    weekdayName: WEEKDAY_NAMES[weekday],
    daysUntil: best,
    isToday: best === 0,
  };
}

/** Next draw for both games, sorted soonest-first. */
export function upcomingDraws(today: Date = new Date()): NextDraw[] {
  return (Object.values(GAMES) as GameConfig[])
    .map((g) => nextDrawFor(g, today))
    .sort((a, b) => a.daysUntil - b.daysUntil);
}

/**
 * Which game should be shown first today? Whichever draws soonest; ties break
 * toward EuroMillions (bigger jackpots, drawn first in the week).
 */
export function featuredGame(today: Date = new Date()): GameKey {
  const [first, second] = upcomingDraws(today);
  if (first.daysUntil !== second.daysUntil) return first.game;
  return "euromillions";
}

export function weekdayName(weekday: number): string {
  return WEEKDAY_NAMES[((weekday % 7) + 7) % 7];
}

/** Friendly "in 2 days" / "today" / "tomorrow" phrasing. */
export function countdownLabel(daysUntil: number): string {
  if (daysUntil <= 0) return "Tonight";
  if (daysUntil === 1) return "Tomorrow";
  return `In ${daysUntil} days`;
}

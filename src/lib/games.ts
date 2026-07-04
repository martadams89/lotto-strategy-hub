// -----------------------------------------------------------------------------
// Game definitions, ball colours, and shared types.
//
// Everything here is factual: how each game is actually played, and the real
// colour bands used on the physical balls. No prediction claims live in this
// file — it just describes the games.
// -----------------------------------------------------------------------------

export type GameKey = "euromillions" | "lotto";

export interface Draw {
  /** ISO date, YYYY-MM-DD */
  date: string;
  /** Main balls, always sorted ascending */
  numbers: number[];
  /** EuroMillions Lucky Stars (empty for Lotto) */
  stars: number[];
  /** UK Lotto bonus ball */
  bonus?: number;
}

/** A weekday index as returned by Date.getUTCDay(): Sun=0 … Sat=6 */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface GameConfig {
  key: GameKey;
  /** Human-facing name */
  name: string;
  /** Short name for tight spaces */
  shortName: string;
  /** How many main balls are drawn */
  mainCount: number;
  /** Main balls run 1..mainMax */
  mainMax: number;
  /** How many stars are drawn (EuroMillions only) */
  starCount: number;
  /** Stars run 1..starMax (0 when the game has no stars) */
  starMax: number;
  /** Whether the game has a bonus ball (UK Lotto) */
  hasBonus: boolean;
  /** The two weekdays this game is drawn on */
  drawDays: [Weekday, Weekday];
  /** Odds of matching the full jackpot line — the real, fixed figure */
  jackpotOdds: string;
  /** First draw in the modern format (for "since" copy) */
  since: string;
}

export const GAMES: Record<GameKey, GameConfig> = {
  euromillions: {
    key: "euromillions",
    name: "EuroMillions",
    shortName: "Euro",
    mainCount: 5,
    mainMax: 50,
    starCount: 2,
    starMax: 12,
    hasBonus: false,
    drawDays: [2, 5], // Tuesday & Friday
    jackpotOdds: "1 in 139,838,160",
    since: "2004",
  },
  lotto: {
    key: "lotto",
    name: "UK Lotto",
    shortName: "Lotto",
    mainCount: 6,
    mainMax: 59,
    starCount: 0,
    starMax: 0,
    hasBonus: true,
    drawDays: [3, 6], // Wednesday & Saturday
    jackpotOdds: "1 in 45,057,474",
    since: "1994",
  },
};

export const GAME_KEYS: GameKey[] = ["euromillions", "lotto"];

// -----------------------------------------------------------------------------
// Ball colours.
//
// UK Lotto balls are coloured in real life by their number band. We reproduce
// those bands. EuroMillions balls are a single colour in real life, but for a
// clearer, friendlier UI we band them too. Stars are always gold.
// Each entry is [background, ink] so text stays readable on the ball.
// -----------------------------------------------------------------------------

export interface BallColour {
  bg: string;
  ink: string;
  /** A soft ring colour for focus / hover states */
  ring: string;
}

// A calm, accessible band palette (WCAG-friendly ink on each bg).
const BANDS: BallColour[] = [
  { bg: "#e7eaf0", ink: "#1f2733", ring: "#c3cad6" }, //  1–9  soft grey (real Lotto: white)
  { bg: "#3b82f6", ink: "#ffffff", ring: "#93c5fd" }, // 10–19 blue
  { bg: "#ec4899", ink: "#ffffff", ring: "#f9a8d4" }, // 20–29 pink
  { bg: "#22c55e", ink: "#08340f", ring: "#86efac" }, // 30–39 green
  { bg: "#8b5cf6", ink: "#ffffff", ring: "#c4b5fd" }, // 40–49 purple
  { bg: "#f59e0b", ink: "#3a2600", ring: "#fcd34d" }, // 50–59 amber
];

const STAR_COLOUR: BallColour = { bg: "#facc15", ink: "#3a2d00", ring: "#fde68a" };
const BONUS_COLOUR: BallColour = { bg: "#0f172a", ink: "#e2e8f0", ring: "#475569" };

/** Colour for a main ball, banded by its tens digit. */
export function ballColour(n: number): BallColour {
  const band = Math.min(BANDS.length - 1, Math.floor((n - 1) / 10));
  return BANDS[Math.max(0, band)];
}

export function starColour(): BallColour {
  return STAR_COLOUR;
}

export function bonusColour(): BallColour {
  return BONUS_COLOUR;
}

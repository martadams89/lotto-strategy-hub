// -----------------------------------------------------------------------------
// Upcoming estimated jackpots.
//
// The estimated jackpot for the next draw is a real, published figure — so
// showing it is honest, unlike the fabricated *historical* winner data we
// removed. Two hard constraints shape how we do it:
//
//   1. It must be fetched server-side (the operator's site blocks cross-origin
//      browser requests), so it lives in a static file that's only as fresh as
//      the last update.
//   2. We will NEVER display a number we haven't verified. If we don't have a
//      fresh, in-range figure, we link the visitor to the official source
//      instead of guessing.
//
// public/data/jackpots.json holds any verified figures; when it's empty we fall
// back to the official link.
// -----------------------------------------------------------------------------

import { GameKey } from "./games";

export interface JackpotEntry {
  /** Display string exactly as published, e.g. "£177 Million" */
  amount: string;
  /** ISO date the figure applies to (the draw date) */
  drawDate: string;
  /** ISO timestamp the figure was fetched/verified */
  fetchedAt: string;
}

export interface JackpotFile {
  updatedAt: string | null;
  games: Partial<Record<GameKey, JackpotEntry>>;
}

export const OFFICIAL_RESULT_URL: Record<GameKey, string> = {
  euromillions: "https://www.national-lottery.co.uk/games/euromillions",
  lotto: "https://www.national-lottery.co.uk/games/lotto",
};

const BASE = import.meta.env.BASE_URL ?? "/";
const MAX_AGE_DAYS = 8;

export async function loadJackpots(signal?: AbortSignal): Promise<JackpotFile> {
  try {
    const res = await fetch(`${BASE}data/jackpots.json`, { signal });
    if (!res.ok) return { updatedAt: null, games: {} };
    return (await res.json()) as JackpotFile;
  } catch {
    return { updatedAt: null, games: {} };
  }
}

/** A figure is only shown if it was verified recently — never stale. */
export function isFresh(entry: JackpotEntry | undefined | null): entry is JackpotEntry {
  if (!entry?.fetchedAt) return false;
  const age = Date.now() - Date.parse(entry.fetchedAt);
  return Number.isFinite(age) && age >= 0 && age <= MAX_AGE_DAYS * 86400000;
}

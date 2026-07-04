// -----------------------------------------------------------------------------
// Loading the draw archive at runtime.
//
// The datasets live as static assets under /data. We fetch them same-origin
// (no external dependency, works offline once cached) and run every draw
// through validation so nothing malformed can ever reach the UI — even if a bad
// row slips into the file.
// -----------------------------------------------------------------------------

import { Draw, GameConfig, GameKey } from "./games";
import { sanitiseDraws } from "./validate";

export interface LoadedGame {
  draws: Draw[];
  /** How many rows were rejected by validation on load */
  dropped: number;
}

const BASE = import.meta.env.BASE_URL ?? "/";

export async function loadGame(game: GameConfig, signal?: AbortSignal): Promise<LoadedGame> {
  const res = await fetch(`${BASE}data/${game.key}.json`, { signal });
  if (!res.ok) throw new Error(`Could not load ${game.name} data (HTTP ${res.status})`);
  const raw = (await res.json()) as Draw[];
  if (!Array.isArray(raw)) throw new Error(`${game.name} data is not an array`);
  const { clean, dropped } = sanitiseDraws(raw, game);
  return { draws: clean, dropped: dropped.length };
}

export type { GameKey };

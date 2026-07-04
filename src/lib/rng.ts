// -----------------------------------------------------------------------------
// Deterministic, seedable pseudo-random number generation.
//
// This is honest RNG: given the same seed it always produces the same stream.
// We use it so that a visitor's "your numbers" stay stable for them, while
// being different for everybody else. It has nothing to do with predicting a
// draw — a fair draw is unpredictable. This just makes our *own* choices
// reproducible.
//
// xmur3 (string -> 32-bit seed) + mulberry32 (seed -> PRNG) are small, fast,
// well-distributed public-domain algorithms.
// -----------------------------------------------------------------------------

/** Hash an arbitrary string into a 32-bit unsigned integer seed. */
export function hashSeed(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^= h >>> 16) >>> 0;
}

export type Rng = () => number;

/** mulberry32: returns a function producing floats in [0, 1). */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Convenience: build an RNG straight from a string seed. */
export function seededRng(seed: string): Rng {
  return mulberry32(hashSeed(seed));
}

/** Integer in [min, max] inclusive. */
export function randInt(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

/** Fisher–Yates shuffle (returns a new array, does not mutate the input). */
export function shuffle<T>(rng: Rng, arr: readonly T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Sample `count` distinct items from `items` with probability proportional to
 * `weights[i]`. Deterministic for a given rng. Weighted sampling without
 * replacement (Efraimidis–Spirakis one-pass reservoir).
 */
export function weightedSample<T>(
  rng: Rng,
  items: readonly T[],
  weights: readonly number[],
  count: number,
): T[] {
  // key_i = u^(1/w_i); take the top `count` keys.
  const keyed = items.map((item, i) => {
    const w = Math.max(1e-9, weights[i]);
    const u = Math.max(1e-12, rng());
    return { item, key: Math.pow(u, 1 / w) };
  });
  keyed.sort((a, b) => b.key - a.key);
  return keyed.slice(0, count).map((k) => k.item);
}

import { describe, it, expect } from "vitest";
import { seededRng, mulberry32, hashSeed, shuffle, weightedSample, randInt } from "../src/lib/rng";

describe("rng determinism", () => {
  it("produces the same stream for the same seed", () => {
    const a = seededRng("hello");
    const b = seededRng("hello");
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it("produces different streams for different seeds", () => {
    const a = seededRng("hello");
    const b = seededRng("world");
    expect(a()).not.toEqual(b());
  });

  it("returns floats in [0, 1)", () => {
    const r = mulberry32(hashSeed("x"));
    for (let i = 0; i < 1000; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("shuffle", () => {
  it("keeps every element (a permutation) and does not mutate input", () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    const out = shuffle(seededRng("s"), input);
    expect([...out].sort((a, b) => a - b)).toEqual(input);
    expect(input).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });
});

describe("weightedSample", () => {
  it("returns the requested count of distinct items", () => {
    const items = Array.from({ length: 50 }, (_, i) => i + 1);
    const weights = items.map(() => 1);
    const picked = weightedSample(seededRng("w"), items, weights, 5);
    expect(picked.length).toBe(5);
    expect(new Set(picked).size).toBe(5);
  });

  it("favours heavily-weighted items over many trials", () => {
    const items = ["rare", "common"];
    const weights = [1, 50];
    let commonFirst = 0;
    for (let i = 0; i < 200; i++) {
      const [first] = weightedSample(seededRng(`t${i}`), items, weights, 1);
      if (first === "common") commonFirst++;
    }
    expect(commonFirst).toBeGreaterThan(150);
  });
});

describe("randInt", () => {
  it("stays within bounds inclusive", () => {
    const r = seededRng("i");
    for (let i = 0; i < 500; i++) {
      const v = randInt(r, 3, 9);
      expect(v).toBeGreaterThanOrEqual(3);
      expect(v).toBeLessThanOrEqual(9);
    }
  });
});

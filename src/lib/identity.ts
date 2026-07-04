// -----------------------------------------------------------------------------
// Per-visitor identity.
//
// The whole point of the split-avoidance strategy is that different people play
// different numbers. So each visitor gets a stable random id, kept in their
// browser. Their "your numbers" are derived from it: identical every time THEY
// visit, but different from everyone else. An optional personal word lets them
// nudge the result without losing determinism.
// -----------------------------------------------------------------------------

const STORAGE_KEY = "lsh:visitor-id";

function randomId(): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
  } catch {
    /* fall through */
  }
  return `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Get (or lazily create) this visitor's stable id. */
export function getVisitorId(): string {
  if (typeof localStorage === "undefined") return "anonymous-visitor";
  try {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = randomId();
      localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    return "anonymous-visitor";
  }
}

/** Replace the visitor id — used by a "give me a fresh identity" action. */
export function resetVisitorId(): string {
  const id = randomId();
  try {
    localStorage?.setItem(STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
  return id;
}

/**
 * The seed used to derive a visitor's numbers. Stable across visits; changes
 * only if they change their personal word or reset their identity.
 */
export function visitorSeed(personalWord?: string): string {
  const word = (personalWord ?? "").trim().toLowerCase();
  return `${getVisitorId()}${word ? `::${word}` : ""}`;
}

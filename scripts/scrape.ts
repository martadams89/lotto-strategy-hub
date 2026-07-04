// -----------------------------------------------------------------------------
// Draw-result updater.
//
// Philosophy: the committed archive under public/data IS the source of truth.
// This script only fetches RECENT official results and merges in any draws we
// don't already have. Every row goes through the same validation the app and
// the test suite use, so a malformed result can never be written — no matter
// what the upstream format does. We store only verifiable facts (date + balls),
// never invented jackpot or winner figures.
//
// The National Lottery publishes the latest draw as XML. Note that some draws
// contain MORE THAN ONE ball-set (special "double" draws — e.g. 2026-07-01 had
// sets L3 and L4). Parsing all balls together is exactly what produced the old
// 12-ball corrupted row, so we parse each <balls> set separately and keep one
// valid draw per date.
// -----------------------------------------------------------------------------

import fs from "node:fs";
import path from "node:path";
import axios from "axios";

import { GAMES, GameConfig, GameKey, Draw } from "../src/lib/games";
import { validateDraw, sanitiseDraws } from "../src/lib/validate";

const OFFICIAL_XML: Record<GameKey, string> = {
  lotto: "https://www.national-lottery.co.uk/results/lotto/draw-history/xml",
  euromillions: "https://www.national-lottery.co.uk/results/euromillions/draw-history/xml",
};

const USER_AGENTS = [
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0",
];

// --- fetching ---------------------------------------------------------------

async function fetchText(url: string, retries = 3): Promise<string | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await axios.get(url, {
        timeout: 20000,
        responseType: "text",
        maxRedirects: 5,
        headers: {
          "User-Agent": USER_AGENTS[attempt % USER_AGENTS.length],
          Accept: "application/xml,text/xml,*/*",
          "Cache-Control": "no-cache",
        },
      });
      if (typeof res.data === "string" && res.data.includes("<draw-results")) return res.data;
      console.warn("  response wasn't the expected XML feed");
      return null;
    } catch (err) {
      console.warn(`  fetch attempt ${attempt}/${retries} failed: ${(err as Error).message}`);
      if (attempt < retries) await new Promise((r) => setTimeout(r, attempt * 1500));
    }
  }
  return null;
}

// --- parsing ----------------------------------------------------------------

/**
 * Parse the official XML into valid draws. Each <balls> set is treated as its
 * own draw and validated independently; we keep the first valid set per date so
 * a multi-set "double draw" can never merge into one corrupt row.
 */
function parseXML(xml: string, game: GameConfig): Draw[] {
  const out: Draw[] = [];
  const seen = new Set<string>();
  let currentDate = "";

  const token = /<draw-date>(.*?)<\/draw-date>|<balls>([\s\S]*?)<\/balls>/g;
  let m: RegExpExecArray | null;
  while ((m = token.exec(xml)) !== null) {
    if (m[1] !== undefined) {
      currentDate = m[1].trim().slice(0, 10);
      continue;
    }
    const block = m[2];
    if (!currentDate || seen.has(currentDate)) continue;

    const numbers = [...block.matchAll(/<ball number="\d+">(\d+)<\/ball>/g)]
      .map((x) => parseInt(x[1], 10))
      .sort((a, b) => a - b);

    const draw: Draw = { date: currentDate, numbers, stars: [] };

    if (game.starCount > 0) {
      draw.stars = [...block.matchAll(/<bonus-ball type="luckystar"[^>]*>(\d+)<\/bonus-ball>/g)]
        .map((x) => parseInt(x[1], 10))
        .sort((a, b) => a - b);
    }
    if (game.hasBonus) {
      const bonus = block.match(/<bonus-ball type="bonusball"[^>]*>(\d+)<\/bonus-ball>/);
      if (bonus) draw.bonus = parseInt(bonus[1], 10);
    }

    if (validateDraw(draw, game).ok) {
      out.push(draw);
      seen.add(currentDate);
    }
  }
  return out;
}

// --- file io ----------------------------------------------------------------

function datasetPath(game: GameConfig): string {
  return path.join(process.cwd(), "public", "data", `${game.key}.json`);
}

function loadExisting(game: GameConfig): Draw[] {
  const file = datasetPath(game);
  if (!fs.existsSync(file)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** One draw per line — compact, with clean git diffs. */
function serialise(draws: Draw[]): string {
  return "[\n" + draws.map((d) => "  " + JSON.stringify(d)).join(",\n") + "\n]\n";
}

// --- main -------------------------------------------------------------------

async function updateGame(game: GameConfig): Promise<number> {
  console.log(`\n▶ ${game.name}`);
  const existing = loadExisting(game);
  const existingDates = new Set(existing.map((d) => d.date));

  const xml = await fetchText(OFFICIAL_XML[game.key]);
  let fresh: Draw[] = [];
  if (xml) {
    fresh = parseXML(xml, game);
    console.log(`  fetched ${fresh.length} valid draw(s) from the official feed`);
  } else {
    console.warn("  no data fetched (network/upstream issue) — keeping existing archive");
  }

  const added = fresh.filter((d) => !existingDates.has(d.date));
  const { clean } = sanitiseDraws([...existing, ...fresh], game);

  const nextContent = serialise(clean);
  const prevContent = fs.existsSync(datasetPath(game)) ? fs.readFileSync(datasetPath(game), "utf8") : "";

  if (nextContent !== prevContent) {
    fs.mkdirSync(path.dirname(datasetPath(game)), { recursive: true });
    fs.writeFileSync(datasetPath(game), nextContent);
    console.log(`  wrote ${clean.length} draws (+${added.length} new): ${added.map((d) => d.date).join(", ") || "reformatted"}`);
  } else {
    console.log(`  no changes (${clean.length} draws)`);
  }
  return added.length;
}

async function main() {
  let total = 0;
  for (const game of Object.values(GAMES)) {
    total += await updateGame(game);
  }
  console.log(`\n✅ Done. ${total} new draw(s) added.`);
}

main().catch((err) => {
  console.error("Scraper failed:", err);
  process.exit(1);
});

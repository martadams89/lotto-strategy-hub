import React, { useEffect, useMemo, useState } from "react";
import { Sparkles, RefreshCw, Copy, Check, ChevronDown, ShieldCheck, ExternalLink } from "lucide-react";

import { GameConfig, GameKey, Draw, GAMES } from "../lib/games";
import { NextDraw, countdownLabel } from "../lib/schedule";
import { formatLongDate, formatDate } from "../lib/format";
import { generateTickets, Ticket } from "../lib/strategy";
import { visitorSeed, resetVisitorId } from "../lib/identity";
import { loadJackpots, isFresh, OFFICIAL_RESULT_URL, JackpotFile } from "../lib/jackpots";
import { Ball, BallRow } from "./Ball";

interface PlayViewProps {
  game: GameConfig;
  draws: Draw[];
  upcoming: NextDraw[];
  onPickGame: (g: GameKey) => void;
}

const LINE_COUNT = 3;

export const PlayView: React.FC<PlayViewProps> = ({ game, draws, upcoming, onPickGame }) => {
  const latest = draws[0];
  const next = upcoming.find((u) => u.game === game.key)!;

  const [word, setWord] = useState("");
  const [nonce, setNonce] = useState(0); // bumped by "new identity"
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [copied, setCopied] = useState<number | null>(null);
  const [explainOpen, setExplainOpen] = useState(false);
  const [jackpots, setJackpots] = useState<JackpotFile>({ updatedAt: null, games: {} });

  useEffect(() => {
    const controller = new AbortController();
    loadJackpots(controller.signal).then(setJackpots).catch(() => {});
    return () => controller.abort();
  }, []);

  // Derive the visitor's stable numbers. Recomputed only when the game, the
  // personal word, or the identity changes — never on a plain re-render.
  useEffect(() => {
    const seed = visitorSeed(word);
    setTickets(generateTickets(game, seed, LINE_COUNT));
  }, [game, word, nonce]);

  function newIdentity() {
    resetVisitorId();
    setNonce((n) => n + 1);
  }

  async function copyLine(t: Ticket, i: number) {
    const text =
      t.numbers.join(" ") + (t.stars.length ? ` — Stars: ${t.stars.join(" ")}` : "");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(i);
      setTimeout(() => setCopied((c) => (c === i ? null : c)), 1500);
    } catch {
      /* clipboard may be blocked; ignore */
    }
  }

  return (
    <div className="space-y-8">
      {/* Upcoming draws — the day-aware banner */}
      <section className="grid sm:grid-cols-2 gap-3">
        {upcoming.map((u) => {
          const g = GAMES[u.game];
          const active = u.game === game.key;
          const entry = jackpots.games[u.game];
          const verified = isFresh(entry);
          return (
            <div
              key={u.game}
              className={`rounded-2xl border transition-all ${
                active
                  ? "border-indigo-500 dark:border-indigo-400 bg-indigo-50/60 dark:bg-indigo-500/10 ring-1 ring-indigo-500/20"
                  : "border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-300 dark:hover:border-stone-700"
              }`}
            >
              <button onClick={() => onPickGame(u.game)} className="w-full text-left p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{g.name}</span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      u.isToday
                        ? "bg-indigo-600 text-white"
                        : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300"
                    }`}
                  >
                    {countdownLabel(u.daysUntil)}
                  </span>
                </div>
                <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                  Next draw · {u.weekdayName}
                </p>
                {verified && (
                  <p className="text-sm mt-2">
                    <span className="font-semibold">{entry!.amount}</span>{" "}
                    <span className="text-stone-400 text-xs">
                      est. · as of {formatDate(entry!.fetchedAt.slice(0, 10))}
                    </span>
                  </p>
                )}
              </button>
              {!verified && (
                <a
                  href={OFFICIAL_RESULT_URL[u.game]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-4 pb-3 -mt-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  See the official estimated jackpot <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          );
        })}
      </section>

      {/* Hero: your numbers for the next draw */}
      <section className="rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden">
        <div className="p-6 sm:p-8 bg-gradient-to-b from-indigo-50/70 to-transparent dark:from-indigo-500/10">
          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            Your numbers
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold mt-1">
            {game.name} · {next.weekdayName} draw
          </h2>
          <p className="text-stone-500 dark:text-stone-400 text-sm mt-1 max-w-xl">
            Uncrowded lines chosen just for you — steered away from birthdays and the numbers most
            people pick, so you’re less likely to share a prize. They stay the same each visit.
          </p>
        </div>

        <div className="p-6 sm:p-8 pt-2 space-y-3">
          {tickets.map((t, i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between rounded-2xl border border-stone-200 dark:border-stone-800 p-4"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-stone-400 dark:text-stone-500 w-6 shrink-0 tnum">
                  {i + 1}
                </span>
                <BallRow numbers={t.numbers} stars={t.stars} />
              </div>
              <div className="flex items-center gap-3 pl-9 sm:pl-0">
                <RarityBadge value={t.score.rarity} />
                <button
                  onClick={() => copyLine(t, i)}
                  className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
                >
                  {copied === i ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <label className="flex-1">
              <span className="sr-only">Personalise your numbers</span>
              <input
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="Add a word to make them yours (optional)"
                maxLength={40}
                className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </label>
            <button
              onClick={newIdentity}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 dark:border-stone-800 px-4 py-2.5 text-sm font-medium hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
              title="Generate a brand-new personal identity"
            >
              <RefreshCw className="w-4 h-4" /> New identity
            </button>
          </div>
        </div>
      </section>

      {/* Latest result */}
      {latest && (
        <section className="rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-display text-xl font-semibold">Latest result</h3>
            <span className="text-sm text-stone-500 dark:text-stone-400">
              {formatLongDate(latest.date)}
            </span>
          </div>
          <div className="mt-4">
            <BallRow numbers={latest.numbers} stars={latest.stars} bonus={latest.bonus} size="lg" />
          </div>
        </section>
      )}

      {/* Honest explainer */}
      <section className="rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
        <button
          onClick={() => setExplainOpen((o) => !o)}
          className="w-full flex items-center justify-between p-5 sm:p-6 text-left"
        >
          <span className="inline-flex items-center gap-2 font-medium">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            What “rarity” means (and what it doesn’t)
          </span>
          <ChevronDown
            className={`w-5 h-5 text-stone-400 transition-transform ${explainOpen ? "rotate-180" : ""}`}
          />
        </button>
        {explainOpen && (
          <div className="px-5 sm:px-6 pb-6 text-sm text-stone-600 dark:text-stone-300 space-y-3 leading-relaxed">
            <p>
              A fair draw is random. Nothing — no model, no AI — can tell you which balls will come
              up next, and this tool never pretends to. Your odds of winning are exactly the same
              whatever numbers you choose.
            </p>
            <p>
              What <em>does</em> differ is how many people share the numbers you pick. Around 70% of
              players choose birthdays (1–31), “lucky” numbers like 7, and neat patterns. If a
              winning line is built from those, the prize gets split many ways. The{" "}
              <strong>rarity score</strong> is our estimate of how uncrowded a line is — higher means
              fewer people are likely to have played it, so a win is more likely to be yours alone.
            </p>
            <p className="text-stone-500 dark:text-stone-400">
              It’s an estimate of human behaviour, not a measured fact, and it changes nothing about
              your chance of winning. Please only ever play what you can comfortably afford to lose.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

const RarityBadge: React.FC<{ value: number }> = ({ value }) => {
  const tone =
    value >= 80
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
      : value >= 60
        ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
        : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300";
  return (
    <span
      className={`text-xs font-semibold px-2.5 py-1 rounded-full tnum ${tone}`}
      title="Estimated uncrowdedness — higher means fewer people likely share this line"
    >
      Rarity {value}
    </span>
  );
};

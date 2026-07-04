import React, { useEffect, useMemo, useRef, useState } from "react";
import { Clover, Ticket, History, BarChart3, Info, Loader2 } from "lucide-react";

import { GAMES, GAME_KEYS, GameKey, Draw } from "./lib/games";
import { analyse, GameAnalytics } from "./lib/analytics";
import { loadGame } from "./lib/data";
import { featuredGame, upcomingDraws } from "./lib/schedule";

import { PlayView } from "./components/PlayView";
import { HistoryView } from "./components/HistoryView";
import { InsightsView } from "./components/InsightsView";
import { AboutView } from "./components/AboutView";

type ViewKey = "play" | "history" | "insights" | "about";

interface GameData {
  draws: Draw[];
  analytics: GameAnalytics;
  dropped: number;
}

const NAV: { id: ViewKey; label: string; icon: React.ElementType }[] = [
  { id: "play", label: "Play", icon: Ticket },
  { id: "history", label: "History", icon: History },
  { id: "insights", label: "Insights", icon: BarChart3 },
  { id: "about", label: "About", icon: Info },
];

export default function App() {
  const today = useMemo(() => new Date(), []);
  const [game, setGame] = useState<GameKey>(() => featuredGame());
  const [view, setView] = useState<ViewKey>(() => {
    const h = (typeof location !== "undefined" ? location.hash.replace("#", "") : "") as ViewKey;
    return NAV.some((n) => n.id === h) ? h : "play";
  });

  // Keep the URL hash in sync so tabs are deep-linkable and bookmarkable.
  useEffect(() => {
    if (typeof location !== "undefined") {
      const target = view === "play" ? " " : `#${view}`;
      if (view === "play") history.replaceState(null, "", location.pathname + location.search);
      else location.hash = target.trim();
    }
  }, [view]);

  const cache = useRef<Partial<Record<GameKey, GameData>>>({});
  const [data, setData] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const upcoming = useMemo(() => upcomingDraws(today), [today]);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function run() {
      if (cache.current[game]) {
        setData(cache.current[game]!);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const cfg = GAMES[game];
        const { draws, dropped } = await loadGame(cfg, controller.signal);
        const analytics = analyse(draws, cfg);
        const gd: GameData = { draws, analytics, dropped };
        if (!cancelled) {
          cache.current[game] = gd;
          setData(gd);
        }
      } catch (e) {
        if (!cancelled && (e as Error).name !== "AbortError") {
          setError((e as Error).message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [game]);

  const cfg = GAMES[game];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-stone-200 dark:border-stone-800 bg-[var(--paper)]/85 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-5 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Clover className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <h1 className="font-display text-lg font-semibold leading-none truncate">
                  Lotto Strategy Hub
                </h1>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 leading-none">
                  Play smart. Win alone.
                </p>
              </div>
            </div>

            {/* Game switch */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              {GAME_KEYS.map((k) => (
                <button
                  key={k}
                  onClick={() => setGame(k)}
                  className={`px-3 sm:px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    game === k
                      ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-sm"
                      : "text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
                  }`}
                >
                  {GAMES[k].shortName}
                </button>
              ))}
            </div>
          </div>

          {/* Nav */}
          <nav className="flex gap-1 -mb-px overflow-x-auto scroll-thin">
            {NAV.map((n) => {
              const Icon = n.icon;
              const active = view === n.id;
              return (
                <button
                  key={n.id}
                  onClick={() => setView(n.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    active
                      ? "border-indigo-600 text-indigo-700 dark:text-indigo-300 dark:border-indigo-400"
                      : "border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {n.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-5 sm:px-6 py-8">
        {loading ? (
          <div className="py-32 flex flex-col items-center gap-3 text-stone-500">
            <Loader2 className="w-6 h-6 animate-spin" />
            <p className="text-sm">Loading {cfg.name} archive…</p>
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto my-20 text-center bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-8">
            <p className="font-medium mb-1">Couldn’t load the data</p>
            <p className="text-sm text-stone-500">{error}</p>
          </div>
        ) : data ? (
          <div key={`${game}-${view}`} className="fade-up">
            {view === "play" && (
              <PlayView game={cfg} draws={data.draws} upcoming={upcoming} onPickGame={setGame} />
            )}
            {view === "history" && <HistoryView game={cfg} draws={data.draws} />}
            {view === "insights" && <InsightsView game={cfg} analytics={data.analytics} />}
            {view === "about" && <AboutView />}
          </div>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 dark:border-stone-800 mt-8">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 py-6 text-xs text-stone-500 dark:text-stone-400 space-y-2">
          <p>
            <strong className="text-stone-700 dark:text-stone-300">No one can predict a lottery draw.</strong>{" "}
            Every combination is equally likely, every time. This tool doesn’t improve your odds of
            winning — it helps you pick numbers fewer people share, so you’re less likely to split a
            prize if you do win.
          </p>
          <p className="flex flex-wrap gap-x-4 gap-y-1">
            <span>© {new Date().getFullYear()} Lotto Strategy Hub</span>
            <span>18+ · Play responsibly</span>
            <a
              href="https://www.begambleaware.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              BeGambleAware.org
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

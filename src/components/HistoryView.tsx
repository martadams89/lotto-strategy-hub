import React, { useMemo, useState } from "react";
import { Search, ChevronLeft, ChevronRight, X } from "lucide-react";

import { GameConfig, Draw } from "../lib/games";
import { formatLongDate, formatDate } from "../lib/format";
import { BallRow } from "./Ball";

interface HistoryViewProps {
  game: GameConfig;
  draws: Draw[];
}

const PAGE_SIZE = 20;

export const HistoryView: React.FC<HistoryViewProps> = ({ game, draws }) => {
  const [query, setQuery] = useState("");
  const [year, setYear] = useState<string>("all");
  const [page, setPage] = useState(0);

  const years = useMemo(() => {
    const set = new Set(draws.map((d) => d.date.slice(0, 4)));
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [draws]);

  const filtered = useMemo(() => {
    const q = query.trim();
    const asNum = Number(q);
    const numberSearch = q !== "" && Number.isInteger(asNum) && asNum >= 1 && asNum <= game.mainMax;
    return draws.filter((d) => {
      if (year !== "all" && !d.date.startsWith(year)) return false;
      if (q === "") return true;
      if (numberSearch) {
        return d.numbers.includes(asNum) || (d.stars?.includes(asNum) ?? false) || d.bonus === asNum;
      }
      return d.date.includes(q) || formatDate(d.date).toLowerCase().includes(q.toLowerCase());
    });
  }, [draws, query, year, game.mainMax]);

  // Reset to first page whenever the filter changes.
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const slice = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  function update<T>(setter: (v: T) => void, v: T) {
    setter(v);
    setPage(0);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">Every {game.name} draw</h2>
        <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">
          {draws.length.toLocaleString()} draws archived, {formatDate(draws[draws.length - 1].date)}{" "}
          → {formatDate(draws[0].date)}. Search a number to see every draw it appeared in.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            value={query}
            onChange={(e) => update(setQuery, e.target.value)}
            placeholder={`Search a number (1–${game.mainMax}) or a date…`}
            className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 pl-10 pr-9 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
          {query && (
            <button
              onClick={() => update(setQuery, "")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <select
          value={year}
          onChange={(e) => update(setYear, e.target.value)}
          className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
        >
          <option value="all">All years</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <p className="text-xs text-stone-500 dark:text-stone-400">
        {filtered.length.toLocaleString()} {filtered.length === 1 ? "draw" : "draws"} match
      </p>

      {/* Rows */}
      <div className="rounded-2xl border border-stone-200 dark:border-stone-800 divide-y divide-stone-100 dark:divide-stone-800 overflow-hidden">
        {slice.length === 0 ? (
          <div className="p-10 text-center text-sm text-stone-500">No draws match your search.</div>
        ) : (
          slice.map((d) => {
            const sum = d.numbers.reduce((a, n) => a + n, 0);
            return (
              <div
                key={d.date}
                className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors"
              >
                <div className="sm:w-44 shrink-0">
                  <div className="text-sm font-medium">{formatLongDate(d.date)}</div>
                  <div className="text-xs text-stone-400 tnum">Sum {sum}</div>
                </div>
                <BallRow numbers={d.numbers} stars={d.stars} bonus={d.bonus} size="sm" />
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={safePage === 0}
            className="inline-flex items-center gap-1 text-sm font-medium px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 disabled:opacity-40 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <span className="text-sm text-stone-500 tnum">
            Page {safePage + 1} of {pageCount}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={safePage >= pageCount - 1}
            className="inline-flex items-center gap-1 text-sm font-medium px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 disabled:opacity-40 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

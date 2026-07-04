import React from "react";
import { Info } from "lucide-react";

import { GameConfig, ballColour } from "../lib/games";
import { GameAnalytics, NumberStat } from "../lib/analytics";
import { formatDate } from "../lib/format";

interface InsightsViewProps {
  game: GameConfig;
  analytics: GameAnalytics;
}

export const InsightsView: React.FC<InsightsViewProps> = ({ game, analytics }) => {
  const naturalCentre = Math.round((game.mainCount * (game.mainMax + 1)) / 2);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-semibold">Insights</h2>
        <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">
          {analytics.totalDraws.toLocaleString()} draws, {formatDate(analytics.firstDate)} →{" "}
          {formatDate(analytics.lastDate)}.
        </p>
      </div>

      {/* The honest caveat, up front */}
      <div className="rounded-2xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/60 dark:bg-indigo-500/10 p-4 flex gap-3">
        <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <p className="text-sm text-stone-700 dark:text-stone-200 leading-relaxed">
          These charts describe what <em>has</em> happened. They do <strong>not</strong> predict what
          will. In a fair draw every number is equally likely every time — the closest thing to a
          pattern below is how <em>flat</em> it all is, which is exactly what randomness looks like.
        </p>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Draws recorded" value={analytics.totalDraws.toLocaleString()} />
        <Stat label="Typical sum" value={`${analytics.sum.mean}`} sub={`centre ≈ ${naturalCentre}`} />
        <Stat label="Odd balls / line" value={`${((analytics.oddShare / 100) * game.mainCount).toFixed(1)}`} sub={`of ${game.mainCount}`} />
        <Stat label="Balls in 1–31" value={analytics.birthdayZoneAvg.toFixed(1)} sub="per line" />
      </div>

      {/* Frequency histogram */}
      <section className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 sm:p-6">
        <div className="flex items-baseline justify-between flex-wrap gap-2">
          <h3 className="font-medium">How often each number has been drawn</h3>
          <span className="text-xs text-stone-500">
            dashed line = perfectly even chance
          </span>
        </div>
        <FrequencyChart stats={analytics.main} expectedPct={analytics.expectedPct} max={game.mainMax} />
        {game.key === "lotto" && (
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-4 leading-relaxed">
            Numbers 50–59 sit lower only because they’re newer: Lotto used 1–49 until the October
            2015 expansion, so those balls have simply had fewer draws to appear in — not because
            they’re “cold”.
          </p>
        )}
      </section>

      {/* Descriptive hot/cold — clearly labelled as NOT predictive */}
      <section className="grid sm:grid-cols-2 gap-3">
        <NumberChips
          title="Most drawn (so far)"
          note="Purely historical. These are not “due” to keep appearing."
          numbers={analytics.hottest}
        />
        <NumberChips
          title="Least drawn (so far)"
          note="Also not “due”. A cold number is no more likely next time."
          numbers={analytics.coldest}
        />
      </section>

      {/* Stars (EuroMillions) */}
      {game.starCount > 0 && analytics.stars.length > 0 && (
        <section className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 sm:p-6">
          <h3 className="font-medium mb-1">Lucky Star frequency</h3>
          <StarBars stats={analytics.stars} />
        </section>
      )}
    </div>
  );
};

const Stat: React.FC<{ label: string; value: string; sub?: string }> = ({ label, value, sub }) => (
  <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4">
    <div className="text-xs text-stone-500 dark:text-stone-400">{label}</div>
    <div className="text-2xl font-semibold font-display mt-1 tnum">{value}</div>
    {sub && <div className="text-xs text-stone-400 mt-0.5 tnum">{sub}</div>}
  </div>
);

const FrequencyChart: React.FC<{ stats: NumberStat[]; expectedPct: number; max: number }> = ({
  stats,
  expectedPct,
}) => {
  const maxCount = Math.max(...stats.map((s) => s.count), 1);
  // Under a perfectly even (flat) chance, every number appears the same number
  // of times, which is just the average of the observed counts.
  const expected = sumCounts(stats) / stats.length;
  const expectedTop = 100 - (expected / maxCount) * 100;

  return (
    <div className="mt-5">
      <div className="relative">
        <div
          className="absolute left-0 right-0 border-t border-dashed border-indigo-400/70 dark:border-indigo-300/50 z-10"
          style={{ top: `${expectedTop}%` }}
          aria-hidden
        />
        <div className="flex items-end gap-[2px] h-40">
          {stats.map((s) => (
            <div
              key={s.n}
              className="flex-1 rounded-t-sm hover:opacity-80 transition-opacity"
              style={{
                height: `${Math.max(2, (s.count / maxCount) * 100)}%`,
                background: ballColour(s.n).bg,
              }}
              title={`Number ${s.n}: drawn ${s.count} times (${s.pct.toFixed(1)}%)`}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-between text-[10px] text-stone-400 mt-1.5 tnum">
        <span>1</span>
        <span>{Math.round(stats.length / 2)}</span>
        <span>{stats.length}</span>
      </div>
    </div>
  );
};

function sumCounts(stats: NumberStat[]): number {
  return stats.reduce((a, s) => a + s.count, 0);
}

const StarBars: React.FC<{ stats: NumberStat[] }> = ({ stats }) => {
  const maxCount = Math.max(...stats.map((s) => s.count), 1);
  return (
    <div className="flex items-end gap-1.5 h-28 mt-3">
      {stats.map((s) => (
        <div key={s.n} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t-sm bg-amber-400"
            style={{ height: `${Math.max(4, (s.count / maxCount) * 100)}%` }}
            title={`Star ${s.n}: ${s.count} times`}
          />
          <span className="text-[10px] text-stone-400 tnum">{s.n}</span>
        </div>
      ))}
    </div>
  );
};

const NumberChips: React.FC<{ title: string; note: string; numbers: number[] }> = ({
  title,
  note,
  numbers,
}) => (
  <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5">
    <h3 className="font-medium">{title}</h3>
    <div className="flex flex-wrap gap-2 mt-3">
      {numbers.map((n) => (
        <span
          key={n}
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold tnum"
          style={{ background: ballColour(n).bg, color: ballColour(n).ink }}
        >
          {n < 10 ? `0${n}` : n}
        </span>
      ))}
    </div>
    <p className="text-xs text-stone-500 dark:text-stone-400 mt-3">{note}</p>
  </div>
);

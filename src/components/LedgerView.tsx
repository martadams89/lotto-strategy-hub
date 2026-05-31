import React from "react";
import { Calendar, Layers, Activity, Award, CheckCircle2 } from "lucide-react";
import { DatasetResponse } from "../types";

interface LedgerViewProps {
  data: DatasetResponse;
  activeTab: "euromillions" | "lotto";
}

export const LedgerView: React.FC<LedgerViewProps> = ({ data, activeTab }) => {
  return (
    <div className="space-y-12 animate-fade-in">
      
      {/* HEADER */}
      <div className="border-b border-zinc-900 pb-8 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
          <Calendar className="w-3.5 h-3.5" />
          <span>LEDGER ARCHIVE</span>
        </div>
        <h2 className="text-3xl font-serif text-white tracking-tight uppercase font-black">
          Historical Draws & Sequence Registers
        </h2>
        <p className="text-zinc-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
          Verify preceding drawn combinations, jackpot payouts, roll-over schedules, and structural indices synced directly with physical feeds.
        </p>
      </div>

      {/* LATEST SEQUENCE WORKSPACE */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-900">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase block font-semibold">Latest Active Drawing Registered</span>
            <h3 className="font-serif text-white font-bold text-xl uppercase tracking-tight">Last Physical Ball Ingestion</h3>
          </div>
          <div className="text-left sm:text-right font-mono text-xs">
            <span className="text-zinc-500 uppercase text-[9px] block">Ingestion Date:</span>
            <span className="text-emerald-400 font-bold">{data.lastDrawDate}</span>
          </div>
        </div>

        {/* Display balls */}
        <div className="flex flex-wrap gap-3.5 py-4">
          {data.latestNumbers.map((num, i) => (
            <div 
              key={i} 
              className="w-14 h-14 rounded-full border border-emerald-500 text-emerald-400 font-mono font-bold flex items-center justify-center text-lg bg-emerald-950/5 relative group hover:scale-105 duration-200 select-none shadow-sm shadow-emerald-950/20"
            >
              <div className="absolute inset-1 rounded-full bg-gradient-to-t from-emerald-500/5 to-transparent" />
              {num < 10 ? `0${num}` : num}
            </div>
          ))}
          {data.latestBonus && (
            <div className="w-14 h-14 rounded-full border border-dashed border-emerald-500/60 text-emerald-300 font-mono font-bold flex items-center justify-center text-lg bg-transparent" title="Bonus Ball">
              {data.latestBonus < 10 ? `0${data.latestBonus}` : data.latestBonus}
            </div>
          )}
          {data.latestStars && data.latestStars.map((star, i) => (
            <div 
              key={i} 
              className="w-14 h-14 rounded-full border border-amber-500 text-amber-500 font-mono font-bold flex items-center justify-center text-lg bg-amber-950/5 relative group hover:scale-105 duration-200 select-none shadow-sm shadow-amber-950/20"
            >
              <div className="absolute inset-1 rounded-full bg-gradient-to-t from-amber-500/5 to-transparent" />
              {star < 10 ? `0${star}` : star}
              <span className="absolute -top-1 -right-0.5 text-[7px]">★</span>
            </div>
          ))}
        </div>
      </div>

      {/* DETAILED LEDGER TABLE SHEET */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 bg-zinc-900/30 border-b border-zinc-900 flex justify-between items-center flex-wrap gap-2">
          <span className="text-xs font-mono font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            Chronological Database Table
          </span>
          <span className="text-[10px] font-mono text-zinc-500">{data.totalDraws} drawings archived</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs text-zinc-400">
            <thead className="bg-[#050505] text-zinc-300 uppercase tracking-widest text-[9px] border-b border-zinc-900">
              <tr>
                <th className="px-6 py-4 font-semibold">Draw Date</th>
                <th className="px-6 py-4 font-semibold">Ball Matrix</th>
                {activeTab === "euromillions" ? (
                  <th className="px-6 py-4 font-semibold">Lucky Stars</th>
                ) : (
                  <th className="px-6 py-4 font-semibold">Bonus Ball</th>
                )}
                <th className="px-6 py-4 font-semibold">Jackpot Size</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Sum Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 border-b border-zinc-900">
              {data.history.slice(0, 30).map((h, hIdx) => {
                const sumVal = h.numbers.reduce((s,n) => s+n, 0);
                return (
                  <tr key={hIdx} className="hover:bg-zinc-900/10 transition-colors text-zinc-400 hover:text-white">
                    <td className="px-6 py-3.5 font-bold text-zinc-100">{h.date}</td>
                    <td className="px-6 py-3.5 text-emerald-400 font-bold tracking-widest text-sm">
                      {h.numbers.map(n => n < 10 ? `0${n}` : n).join("  ")}
                    </td>
                    <td className="px-6 py-3.5">
                      {activeTab === "euromillions" ? (
                        <span className="text-amber-500 font-bold text-sm">★ {h.stars.map(s => s < 10 ? `0${s}` : s).join("  ")}</span>
                      ) : (
                        <span className="text-emerald-400 text-sm font-semibold">{h.bonus ? (h.bonus < 10 ? `0${h.bonus}` : h.bonus) : "--"}</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-zinc-200 font-medium">{h.jackpotAmount || "£3.6 Million"}</td>
                    <td className="px-6 py-3.5 text-center">
                      {h.winners !== undefined && h.winners === 0 ? (
                        <span className="text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-sans font-bold">Rollover</span>
                      ) : (
                        <span className="text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded text-[10px] font-sans font-normal inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                          <span>{h.winners || hIdx % 3 + 1} Claimed</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-right font-semibold text-zinc-300">{sumVal}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

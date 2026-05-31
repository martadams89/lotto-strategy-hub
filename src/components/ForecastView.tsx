import React, { useState } from "react";
import { Shield, Sparkles, AlertCircle, Info, ChevronRight, HelpCircle } from "lucide-react";
import { DatasetResponse, WeeklyDrawPrediction, PredictionCard } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface ForecastViewProps {
  data: DatasetResponse;
  activeTab: "euromillions" | "lotto";
}

export const ForecastView: React.FC<ForecastViewProps> = ({ data, activeTab }) => {
  const [selectedTactic, setSelectedTactic] = useState<string | null>(null);

  const draws = data.weeklyPredictions || [];

  return (
    <div className="space-y-12 animate-fade-in">
      
      {/* BRIEF INTRO LEVEL */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-zinc-900 pb-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ACTIVE OPTIMIZER RUNNING</span>
          </div>
          <h2 className="text-3xl font-serif text-white tracking-tight uppercase font-black">
            Optimal Weekly Slips
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
            The mathematical model has generated exactly two distinct strategic plays for both drawing cycles this week. Choose the tactic that aligns with your expectation targets.
          </p>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl text-right shrink-0">
          <span className="text-[10px] font-mono text-zinc-500 block uppercase">ESTIMATED DRAW SIZE</span>
          <span className="text-lg font-mono font-bold text-emerald-400">
            {activeTab === "lotto" ? "£7.5 Million" : "£48 Million"}
          </span>
        </div>
      </div>

      {/* DRAWINGS CONTAINER */}
      <div className="space-y-16">
        {draws.map((draw, drawIdx) => (
          <div key={drawIdx} className="space-y-8">
            
            {/* Draw Header */}
            <div className="flex items-center justify-between border-l-2 border-emerald-500 pl-4 py-1">
              <div>
                <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider block">
                  {draw.drawName} Cycle
                </span>
                <h3 className="text-xl font-serif font-black text-white uppercase tracking-tight mt-0.5">
                  Scheduled for {draw.day} Draw
                </h3>
              </div>
              <span className="text-[10px] font-mono bg-zinc-950 px-3 py-1 text-zinc-400 border border-zinc-900 rounded-sm">
                Type: {draw.type}
              </span>
            </div>

            {/* Tactical Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {draw.predictions.map((pred, predIdx) => {
                const isJackpotEV = pred.label.includes("Jackpot");
                const uniqueKey = `${drawIdx}-${predIdx}`;
                const isSelected = selectedTactic === uniqueKey;

                return (
                  <div
                    key={predIdx}
                    className={`group relative border rounded-2xl p-6 bg-gradient-to-b from-zinc-950 to-black transition-all duration-300 flex flex-col justify-between min-h-[420px] ${
                      isSelected 
                        ? "border-emerald-500 shadow-2xl shadow-emerald-950/20" 
                        : "border-zinc-900 hover:border-zinc-800"
                    }`}
                  >
                    {/* Corner Strategic Tag */}
                    <div className="absolute top-4 right-4">
                      <span className={`text-[9px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 border rounded-sm ${
                        isJackpotEV 
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20" 
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      }`}>
                        {isJackpotEV ? "Game Theory Mode" : "Frequentist Mode"}
                      </span>
                    </div>

                    <div className="space-y-6">
                      {/* Name & Strategy Index */}
                      <div>
                        <span className="text-[9px] font-mono text-zinc-500 tracking-widest uppercase block mb-1">
                          DECISION PATHWAY {predIdx + 1}
                        </span>
                        <h4 className="text-2xl font-serif font-bold text-white tracking-tight">
                          {pred.label}
                        </h4>
                        <p className="text-xs text-zinc-400 mt-2 font-mono leading-relaxed bg-zinc-950 border border-zinc-900 px-3 py-2 rounded-lg">
                          Objective: <span className="text-white font-semibold">{pred.objective}</span>
                        </p>
                      </div>

                      {/* Ball Array */}
                      <div className="space-y-2.5">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">
                          Forecasted Combination:
                        </span>
                        
                        <div className="flex flex-wrap gap-2.5 pt-1">
                          {pred.numbers.map((n, i) => (
                            <div
                              key={i}
                              className="w-12 h-12 rounded-full bg-gradient-to-tr from-zinc-900 to-black hover:from-emerald-950 hover:to-zinc-950 text-white font-bold font-mono flex items-center justify-center text-sm border border-zinc-800 group-hover:border-emerald-600/40 relative shadow-lg hover:scale-110 duration-200 cursor-default select-none group"
                            >
                              <div className="absolute inset-[1px] rounded-full bg-gradient-to-t from-emerald-500/5 to-transparent" />
                              {n < 10 ? `0${n}` : n}
                            </div>
                          ))}
                          
                          {pred.stars.map((s, i) => (
                            <div
                              key={i}
                              className="w-12 h-12 rounded-full bg-gradient-to-tr from-zinc-950 to-zinc-900 hover:from-amber-950 hover:to-zinc-950 text-amber-400 font-extrabold font-mono flex items-center justify-center text-sm border border-amber-900/30 group-hover:border-amber-500/30 relative shadow-lg hover:scale-110 duration-200 cursor-default select-none"
                            >
                              <div className="absolute inset-[1px] rounded-full bg-gradient-to-t from-amber-500/5 to-transparent" />
                              {s < 10 ? `0${s}` : s}
                              <span className="absolute -top-0.5 right-0.5 text-[8px] text-amber-500 font-bold">★</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Mathematical Context Info */}
                      <p className="text-xs text-zinc-400 leading-relaxed pr-2">
                        {pred.explanation}
                      </p>
                    </div>

                    {/* Footer Telemetry */}
                    <div className="mt-8 border-t border-zinc-900/80 pt-4 flex items-center justify-between">
                      <div className="font-mono text-[10px] space-y-1">
                        <span className="text-zinc-500 uppercase block tracking-wider">Probability Weight</span>
                        <span className="text-zinc-300 font-bold">{pred.payoutPower}</span>
                      </div>
                      <div className="font-mono text-[10px] text-right space-y-1">
                        <span className="text-zinc-500 uppercase block tracking-wider">Odds Margin</span>
                        <span className="text-white font-bold">{pred.oddsExponent}</span>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};

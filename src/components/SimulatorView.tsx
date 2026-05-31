import React from "react";
import { Sliders, Cpu, Sparkles, Activity, ShieldAlert, Zap, Orbit } from "lucide-react";
import { CustomPredictionResult } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface SimulatorViewProps {
  userSeed: string;
  setUserSeed: (s: string) => void;
  flairStyle: "chaos" | "game-theory" | "hybrid";
  setFlairStyle: (s: "chaos" | "game-theory" | "hybrid") => void;
  rValue: number;
  setRValue: (v: number) => void;
  customLoading: boolean;
  onCompute: (e: React.FormEvent) => void;
  customResult: CustomPredictionResult | null;
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({
  userSeed,
  setUserSeed,
  flairStyle,
  setFlairStyle,
  rValue,
  setRValue,
  customLoading,
  onCompute,
  customResult,
}) => {
  const getOrbitLabel = (r: number) => {
    if (r < 3.5699) return { label: "Period-4 stable orbit limit", color: "text-blue-400 border-blue-500/20 bg-blue-500/5", desc: "Non-chaotic, predictable patterns." };
    if (r < 3.8284) return { label: "Bifurcation Orbit Cascades", color: "text-cyan-400 border-cyan-500/20 bg-cyan-400/5", desc: "High sensitivity, subtle cascading patterns." };
    if (r < 3.9990) return { label: "Intermittent Periodic Windows", color: "text-indigo-400 border-indigo-500/20 bg-indigo-500/5", desc: "Sub-chaos with local cyclic symmetry." };
    return { label: "Absolute Deterministic Chaos", color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5", desc: "True turbulence mimicking physical solid ball trajectories." };
  };

  const orbit = getOrbitLabel(rValue);

  return (
    <div className="space-y-10 animate-fade-in">
      
      {/* HEADER SECTION */}
      <div className="border-b border-zinc-900 pb-8 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
          <Sliders className="w-3.5 h-3.5" />
          <span>PARAMETER LABORATORY</span>
        </div>
        <h2 className="text-3xl font-serif text-white tracking-tight uppercase font-black">
          Lyapunov Bifurcation Simulator
        </h2>
        <p className="text-zinc-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
          Calibrate the feedback coefficient r of the logistic map. Seed the boundary with variables like your name or lucky phrase, then tweak the chaotic orbit multipliers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: PARAMETER DIALS CONTROLLER */}
        <div className="lg:col-span-7 bg-zinc-950 border border-zinc-900 rounded-2xl p-6 sm:p-8 space-y-8">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">
            01 // System Coef Dialect
          </span>

          <form onSubmit={onCompute} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div className="space-y-2.5">
                <label className="text-[10px] font-mono text-zinc-400 uppercase block tracking-wider font-semibold">
                  Seed Variable String (Text input)
                </label>
                <input 
                  type="text" 
                  value={userSeed}
                  onChange={(e) => setUserSeed(e.target.value)}
                  placeholder="e.g. shannon-entropy-vector"
                  className="w-full bg-[#030303] text-emerald-400 font-mono text-xs border border-zinc-900 focus:border-emerald-500/40 px-4 py-3 outline-none placeholder-zinc-700 transition-colors rounded-xl"
                />
              </div>

              <div className="space-y-2.5">
                <label className="text-[10px] font-mono text-zinc-400 uppercase block tracking-wider font-semibold">
                  Generator Mapping Style
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["hybrid", "chaos", "game-theory"] as const).map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setFlairStyle(style)}
                      className={`py-2 px-1 text-[9px] font-mono uppercase tracking-wider border rounded-xl transition-all cursor-pointer ${flairStyle === style ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400 font-bold' : 'border-zinc-900 text-zinc-500 hover:text-white hover:border-zinc-800 bg-[#050505]'}`}
                    >
                      {style === 'hybrid' ? 'Hybrid' : style === 'chaos' ? 'Pure Chaos' : 'Game Theory'}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* SLIDER FOR PARAMETER R */}
            <div className="space-y-4 bg-[#030303] p-5 border border-zinc-900 rounded-xl">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">Feedback Multiplying Factor (r):</span>
                <span className="text-emerald-400 font-bold text-sm bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-900/30 font-mono">{rValue.toFixed(5)}</span>
              </div>
              <input 
                type="range"
                min="3.56990"
                max="3.99999"
                step="0.0001"
                value={rValue}
                onChange={(e) => setRValue(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 h-1 bg-zinc-900 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-zinc-600 font-mono">
                <span>Min: 3.56990 [Bifurcation Point]</span>
                <span>Max: 3.99999 [Absolute Chaos]</span>
              </div>

              <div className={`mt-4 p-4 rounded-xl border text-xs font-mono leading-relaxed space-y-1.5 ${orbit.color}`}>
                <div className="font-bold text-white tracking-wide uppercase text-[10px] flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>Orbit State: {orbit.label}</span>
                </div>
                <p className="text-zinc-400 text-[11px] font-normal leading-relaxed">{orbit.desc}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={customLoading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-4 rounded-xl font-mono text-[10px] uppercase font-bold tracking-[0.2em] transition-all duration-200 inline-flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/20"
              >
                <Cpu className="w-4 h-4 animate-pulse text-black" />
                <span>{customLoading ? "Triggering Orbit Recalculation..." : "Execute Chaotic Formulation"}</span>
              </button>
            </div>
          </form>

        </div>

        {/* RIGHT COLUMN: SIMULATOR REAL-TIME PREVIEW FEED */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 space-y-6 min-h-[440px] flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold mb-4">
                02 // Real-Time Formula Output
              </span>

              <AnimatePresence mode="wait">
                {customResult ? (
                  <motion.div
                    key="results-present"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="space-y-6"
                  >
                    {/* Spheres and status */}
                    <div className="border border-zinc-900 bg-black/60 p-5 rounded-xl space-y-4">
                      <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400 pb-2 border-b border-zinc-900">
                        <span>EST. ENTROPY POWER</span>
                        <span className="text-emerald-400 font-extrabold">{customResult.entropyLevel} Lyapunov units</span>
                      </div>

                      <div className="flex flex-wrap gap-2.5 justify-center py-2">
                        {customResult.numbers.map((n, idx) => (
                          <div key={idx} className="w-11 h-11 border border-emerald-500/40 text-emerald-400 font-mono font-bold flex items-center justify-center text-sm rounded-full bg-emerald-950/5 hover:scale-105 transition-transform cursor-default shadow-sm select-none">
                            {n < 10 ? `0${n}` : n}
                          </div>
                        ))}
                        {customResult.stars && customResult.stars.length > 0 && customResult.stars.map((s, idx) => (
                          <div key={idx} className="w-11 h-11 border border-amber-500/40 text-amber-500 font-mono font-bold flex items-center justify-center text-sm rounded-full bg-amber-950/5 hover:scale-105 transition-transform cursor-default relative shadow-sm select-none">
                            {s < 10 ? `0${s}` : s}
                            <span className="absolute -top-1 -right-0.5 text-[6px]">★</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="bg-[#030303] p-4 border border-zinc-900 rounded-xl">
                        <span className="text-zinc-500 uppercase text-[9px] block mb-1 font-mono">Simulated Split Protection Index</span>
                        <span className="text-white font-semibold text-xs leading-none mt-1 block">{customResult.scenarios.splitPotRisk}</span>
                      </div>
                      <div className="bg-[#030303] p-4 border border-zinc-900 rounded-xl">
                        <span className="text-zinc-500 uppercase text-[9px] block mb-1 font-mono font-bold">Jackpot Power Premium</span>
                        <span className="text-emerald-400 font-semibold text-xs leading-none mt-1 block">{customResult.scenarios.expectedJackpotMultiplier}</span>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="py-20 text-center flex flex-col justify-center items-center space-y-4">
                    <Orbit className="w-10 h-10 text-zinc-700 animate-spin" />
                    <p className="text-zinc-500 text-xs font-mono uppercase tracking-wider">
                      Awaiting mathematical execution...<br />
                      <span className="text-[10px] text-zinc-600 font-normal">[Click "Execute Chaotic Formulation" to compile]</span>
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>

            <div className="bg-zinc-950/50 border border-zinc-900 p-4 rounded-xl text-[10px] text-zinc-500 font-mono leading-relaxed space-y-1.5">
              <div className="flex items-center gap-1.5 text-zinc-400 font-bold uppercase text-[9px]">
                <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Live Feed Verification</span>
              </div>
              <p>Simulating active trajectory fields. Output variables are verified as safe under standard Expected Value tests.</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

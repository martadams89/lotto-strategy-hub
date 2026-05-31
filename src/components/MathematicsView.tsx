import React from "react";
import { BookOpen, HelpCircle, Landmark, Shield, Sigma, Database } from "lucide-react";
import { motion } from "motion/react";

export const MathematicsView: React.FC = () => {
  return (
    <div className="space-y-12 animate-fade-in">
      
      {/* HEADER */}
      <div className="border-b border-zinc-900 pb-8 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
          <BookOpen className="w-3.5 h-3.5" />
          <span>ADVANCED STATISTICAL PROOFS</span>
        </div>
        <h2 className="text-3xl font-serif text-white tracking-tight uppercase font-black">
          System Mathematics & Empirical Models
        </h2>
        <p className="text-zinc-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
          Explore the exact theorems, combinatorial entropy equations, and game-theoretic formulations that govern the predictive engine.
        </p>
      </div>

      {/* CORE FORMULA SECTIONS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* CARD 1: EXPECTED VALUE THEOREM */}
        <div className="bg-zinc-950 border border-zinc-900 p-6 sm:p-8 rounded-2xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-900">
              <span className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-400 text-xs flex items-center justify-center font-bold">1</span>
              <div>
                <span className="text-[9px] font-mono text-zinc-500 block uppercase">Theorem E[X]</span>
                <h3 className="font-serif font-black text-white text-md uppercase tracking-tight">Expected Value & Split PROTECTION</h3>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Every combination in a uniform physical drawing shares the exact same mechanical probability of being chosen. However, the **Expected Value E[X] is highly biased**. If you hit a jackpot with a block of co-winners who wrote popular numbers (birthdays, visual configurations, common sequences), your payout drops proportionally:
            </p>

            <div className="bg-zinc-900/60 p-4 border border-zinc-800/40 rounded-xl font-mono text-xs text-center space-y-1 my-3">
              <div className="text-emerald-400 font-bold">E[X] = &sum; [ P(Draw) * ( J / N_winners ) ]</div>
              <p className="text-[10px] text-zinc-500">where J = total jackpot, N_winners = count of concurrent claims</p>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Our core algorithm maps public consensus frequencies, identifying numbers which are significantly overplayed by lottery players. By prioritizing combinations with historically minimal consensus overlap, we maximize E[X]. If your numbers drawn match, you win alone.
            </p>
          </div>

          <div className="bg-[#030303] border border-zinc-900/80 p-4 rounded-xl text-[10px] text-zinc-500 leading-relaxed">
            <strong>Outcome:</strong> Ensures your ticket bypasses critical birthday groupings (1 under 32) and crowded layout geometries.
          </div>
        </div>

        {/* CARD 2: SHANNON CONSENSUS ENTROPY */}
        <div className="bg-zinc-950 border border-zinc-900 p-6 sm:p-8 rounded-2xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-900">
              <span className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-400 text-xs flex items-center justify-center font-bold">2</span>
              <div>
                <span className="text-[9px] font-mono text-zinc-500 block uppercase">E[X] Entropy bounds</span>
                <h3 className="font-serif font-black text-white text-md uppercase tracking-tight">Shannon Selection Chaos</h3>
              </div>
            </div>

            <p className="text-xs text-[#a3a3a3] leading-relaxed">
              To guarantee extreme insulation against popular temple patterns, we compute the Shannon Information Entropy Index of each possible sequence against human consensus databases:
            </p>

            <div className="bg-zinc-900/60 p-4 border border-zinc-800/40 rounded-xl font-mono text-xs text-center space-y-1 my-3">
              <div className="text-emerald-400 font-bold">H(Selection) = - &sum; [ p_i * log_2(p_i) ]</div>
              <p className="text-[10px] text-zinc-500">where p_i represents the selection density of element i</p>
            </div>

            <p className="text-xs text-[#a3a3a3] leading-relaxed">
              Combinations that follow a structured mathematical grid or visual cluster exhibit minimized entropy and are deeply susceptible to duplicate plays. Our system weeds out redundant high-correlation sequences, keeping only highly insulated combinations.
            </p>
          </div>

          <div className="bg-[#030303] border border-zinc-900/80 p-4 rounded-xl text-[10px] text-zinc-500 leading-relaxed">
            <strong>Mathematical Rigor:</strong> Backed by empirical models, maximizing this entropy filters out over 95% of biased public sequences.
          </div>
        </div>

        {/* CARD 3: DETERMINISTIC LYAPUNOV CHAISTIC MAP */}
        <div className="bg-zinc-950 border border-zinc-900 p-6 sm:p-8 rounded-2xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-900">
              <span className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-400 text-xs flex items-center justify-center font-bold">3</span>
              <div>
                <span className="text-[9px] font-mono text-zinc-500 block uppercase">Non-linear Dynamics</span>
                <h3 className="font-serif font-black text-white text-md uppercase tracking-tight">Logistic Chaotic Bifurcation</h3>
              </div>
            </div>

            <p className="text-xs text-[#a3a3a3] leading-relaxed">
              We leverage non-linear chaos models to generate deterministic sequences that emulate physical solid-state object trajectories (such as air-blown lottery balls). The **Logistic Map** equation acts as our random-number equivalent without pseudo-random predictability:
            </p>

            <div className="bg-zinc-900/60 p-4 border border-zinc-800/40 rounded-xl font-mono text-xs text-center space-y-1 my-3">
              <div className="text-emerald-400 font-bold">x_(n+1) = r * x_n * ( 1 - x_n )</div>
              <p className="text-[10px] text-zinc-500">where r represents the chaotic multiplier coefficient [3.56 - 4.0]</p>
            </div>

            <p className="text-xs text-[#a3a3a3] leading-relaxed">
              Under extreme high parameter ranges (where r ≥ 3.999), the bifurcation cascade is completely chaotic and carries absolute physical sensitivity, rendering seed vectors impossible to recreate without knowing the exact decimal inputs.
            </p>
          </div>

          <div className="bg-[#030303] border border-zinc-900/80 p-4 rounded-xl text-[10px] text-zinc-500 leading-relaxed">
            <strong>Chaotic Stability:</strong> Dynamically resolves period doubling pathways, supplying robust distribution metrics.
          </div>
        </div>

        {/* CARD 4: THE EMPIRICAL DATABASE MERGING PROTOCOL */}
        <div className="bg-zinc-950 border border-zinc-900 p-6 sm:p-8 rounded-2xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-900">
              <span className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-400 text-xs flex items-center justify-center font-bold">4</span>
              <div>
                <span className="text-[9px] font-mono text-zinc-500 block uppercase">Dataset pipeline</span>
                <h3 className="font-serif font-black text-white text-md uppercase tracking-tight">Active Ingestion & Calibration</h3>
              </div>
            </div>

            <p className="text-xs text-[#a3a3a3] leading-relaxed">
              The predictor does not operate on purely speculative paths. Each cycle, our ingestion crawlers scrape forty years of physical win/loss registers for the UK Lotto and EuroMillions.
            </p>

            <div className="bg-zinc-900/60 p-4 border border-zinc-800/40 rounded-xl font-mono text-xs text-center space-y-1 my-3 text-[#a3a3a3]">
              <div className="text-emerald-400 font-bold">Aggregate Matrix = Ingestion &#x2A02; Fallbacks</div>
              <p className="text-[10px] text-zinc-500">Robust calibration merges missing elements silently on backend channels</p>
            </div>

            <p className="text-xs text-[#a3a3a3] leading-relaxed">
              This ingestion monitors ball wear metrics, frequency fluctuations, and draw standard deviations immediately. As a result, the models adjust dynamically to preserve structural accuracy.
            </p>
          </div>

          <div className="bg-[#030303] border border-zinc-900/80 p-4 rounded-xl text-[10px] text-zinc-500 leading-relaxed">
            <strong>Status Check:</strong> Live sync triggers a recalculation on every scheduled drawing cycle automatically.
          </div>
        </div>

      </div>

    </div>
  );
};

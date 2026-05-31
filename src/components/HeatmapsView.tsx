import React from "react";
import { Flame, Snowflake, BarChart3, TrendingUp, Layers } from "lucide-react";
import { DatasetResponse } from "../types";

interface HeatmapsViewProps {
  data: DatasetResponse;
}

export const HeatmapsView: React.FC<HeatmapsViewProps> = ({ data }) => {
  return (
    <div className="space-y-12 animate-fade-in">
      
      {/* HEADER */}
      <div className="border-b border-zinc-900 pb-8 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>STATISTICAL TRACKER</span>
        </div>
        <h2 className="text-3xl font-serif text-white tracking-tight uppercase font-black">
          Frequency Heatmaps & Density Bins
        </h2>
        <p className="text-zinc-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
          Analyze historical ball selection densities, central limit peak-medians, and active hot/cold indexes harvested from past drawings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: HEATMAP BINS */}
        <div className="lg:col-span-7 bg-zinc-950 border border-zinc-900 rounded-2xl p-6 sm:p-8 space-y-6">
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase block tracking-wider mb-1 font-bold">Frequency Matrix</span>
            <h3 className="font-serif font-black text-white text-lg uppercase tracking-tight">Segment Density Ranges</h3>
          </div>

          <div className="space-y-5">
            {[
              { range: "01 to 15 (Standard Low)", color: "bg-emerald-500", sliceStart: 0, sliceEnd: 15, hasStar: false, desc: "Low-end number groupings." },
              { range: "16 to 31 (Birthday Clusters)", color: "bg-amber-500", sliceStart: 15, sliceEnd: 31, hasStar: true, desc: "High consensus saturation risk due to birthday biases." },
              { range: "32 to 45 (Uncrowded Mid Ranges)", color: "bg-emerald-400", sliceStart: 31, sliceEnd: 45, hasStar: false, desc: "Sparsely played, value-dense numbers." },
              { range: "46+ (High Entropy Margins)", color: "bg-emerald-500", sliceStart: 45, sliceEnd: 60, hasStar: false, desc: "Highly chaotic, rarely played by the generic public." },
            ].map((item, idx) => {
              const sumVal = data.frequencies.slice(item.sliceStart, item.sliceEnd).reduce((s,f) => s + f, 0);
              const percentWidth = Math.min(100, Math.round((sumVal / (data.totalDraws * 2)) * 100));
              return (
                <div key={idx} className="space-y-2 p-3 bg-zinc-900/10 border border-zinc-900/60 rounded-xl">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <div className="space-y-0.5">
                      <span className={`font-bold block ${item.hasStar ? 'text-amber-400' : 'text-zinc-200'}`}>
                        {item.range} {item.hasStar && "★"}
                      </span>
                      <p className="text-[10px] text-zinc-500 font-normal">{item.desc}</p>
                    </div>
                    <span className="font-bold text-zinc-300 bg-zinc-900/80 px-2.5 py-1 border border-zinc-800 rounded-md">
                      {sumVal} Ingested
                    </span>
                  </div>
                  <div className="w-full bg-[#030303] h-1.5 rounded-full overflow-hidden border border-zinc-900">
                    <div 
                      className={`${item.color} h-full transition-all duration-1000`}
                      style={{ width: `${percentWidth || 10}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[10px] font-mono text-zinc-500 leading-relaxed max-w-xl">
            ★ Human drawings are highly concentrated under 31. Sequences choosing exclusively above this threshold bypass public templates, safeguarding unique payout structures.
          </p>
        </div>

        {/* RIGHT COLUMN: DISTRIBUTION + HOT/COLD CORES */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Central Limit Card */}
          <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl space-y-4">
            <div>
              <span className="text-[9px] font-mono text-zinc-500 uppercase block font-bold tracking-wider mb-0.5">Expectation Bound</span>
              <h4 className="font-serif text-white font-bold text-md uppercase tracking-tight">Gaussian Central Limit Curve</h4>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-zinc-900/20 px-3 py-2.5 rounded-lg border border-zinc-900">
              <div className="space-y-0.5">
                <span className="text-zinc-500 block text-[9px] uppercase font-bold">Symmetric Mean (&mu;):</span>
                <span className="text-white font-bold text-sm block">{data.statistics.sumGaussian.avg}</span>
              </div>
              <div className="space-y-0.5 text-right">
                <span className="text-zinc-500 block text-[9px] uppercase font-bold">Standard Dev (&sigma;):</span>
                <span className="text-[#10B981] font-bold text-sm block">&plusmn;{data.statistics.sumGaussian.stdDev}</span>
              </div>
            </div>

            <div className="pt-2">
              <div className="h-14 flex items-end justify-between gap-1 border-b border-zinc-900 pb-1.5">
                <div className="w-full bg-zinc-900/10 h-3 rounded-t" title="Min Outlier"></div>
                <div className="w-full bg-zinc-900/30 h-6 rounded-t" title="-1 Boundary"></div>
                <div className="w-full bg-emerald-500/20 h-10 rounded-t" title="Mid-Optimal Range"></div>
                <div className="w-full bg-emerald-500 h-14 relative rounded-t" title="Exact Symmetric Median">
                  <span className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping" />
                </div>
                <div className="w-full bg-emerald-500/20 h-10 rounded-t" title="Mid-Optimal Range"></div>
                <div className="w-full bg-zinc-900/30 h-6 rounded-t" title="+1 Boundary"></div>
                <div className="w-full bg-zinc-900/10 h-3 rounded-t" title="Max Outlier"></div>
              </div>
              <div className="flex justify-between text-[8px] text-zinc-600 font-mono mt-1 uppercase tracking-wider">
                <span>Low Outlier</span>
                <span>Optimized Mean</span>
                <span>High Outlier</span>
              </div>
            </div>
          </div>

          {/* Hot/Cold Elements */}
          <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl space-y-6">
            
            {/* HOT */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-amber-400 text-[10px] uppercase font-mono font-bold tracking-wider">
                <Flame className="w-4 h-4 shrink-0" />
                <span>Thermally Hot Elements</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {data.statistics.hotNumbers.slice(0, 8).map((num) => (
                  <div key={num} className="bg-[#030303] p-1.5 border border-zinc-900 text-center font-mono rounded-lg">
                    <span className="block text-xs font-bold text-white">{num < 10 ? `0${num}` : num}</span>
                    <span className="text-[8px] text-zinc-600 block">seen {data.frequencies[num-1] || 0}x</span>
                  </div>
                ))}
              </div>
            </div>

            {/* COLD */}
            <div className="space-y-3 border-t border-zinc-900 pt-4">
              <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] uppercase font-mono font-bold tracking-wider">
                <Snowflake className="w-4 h-4 shrink-0" />
                <span>Historically Cold Elements</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {data.statistics.coldNumbers.slice(0, 8).map((num) => (
                  <div key={num} className="bg-[#030303] p-1.5 border border-zinc-900 text-center font-mono rounded-lg">
                    <span className="block text-xs font-bold text-white">{num < 10 ? `0${num}` : num}</span>
                    <span className="text-[8px] text-zinc-600 block">Gap: {data.gaps[num-1] || 0}d</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

import React from "react";
import { ballColour, starColour, bonusColour } from "../lib/games";
import { pad2 } from "../lib/format";

type Kind = "main" | "star" | "bonus";
type Size = "sm" | "md" | "lg";

const SIZES: Record<Size, string> = {
  sm: "w-8 h-8 text-[13px]",
  md: "w-11 h-11 text-base",
  lg: "w-16 h-16 text-2xl",
};

interface BallProps {
  value: number;
  kind?: Kind;
  size?: Size;
  title?: string;
}

/**
 * A single lottery ball, coloured by its number band (matching the real
 * physical UK Lotto colours). Stars are gold; the bonus ball is dark.
 */
export const Ball: React.FC<BallProps> = ({ value, kind = "main", size = "md", title }) => {
  const c = kind === "star" ? starColour() : kind === "bonus" ? bonusColour() : ballColour(value);

  return (
    <span
      className={`${SIZES[size]} relative inline-flex items-center justify-center rounded-full font-semibold tnum shrink-0 select-none`}
      style={{
        background: `radial-gradient(circle at 35% 28%, ${c.ring} 0%, ${c.bg} 55%)`,
        color: c.ink,
        boxShadow: "inset 0 -2px 4px rgba(0,0,0,0.18), 0 1px 2px rgba(0,0,0,0.12)",
      }}
      title={title ?? (kind === "star" ? `Lucky Star ${value}` : kind === "bonus" ? `Bonus ${value}` : `Ball ${value}`)}
      aria-label={kind === "star" ? `Lucky Star ${value}` : `Number ${value}`}
    >
      {kind === "star" && (
        <span className="absolute -top-1 -right-1 text-[10px] leading-none" aria-hidden>
          ★
        </span>
      )}
      {pad2(value)}
    </span>
  );
};

/** A row of main balls, then bonus (Lotto) or stars (Euro). */
export const BallRow: React.FC<{
  numbers: number[];
  stars?: number[];
  bonus?: number;
  size?: Size;
  className?: string;
}> = ({ numbers, stars = [], bonus, size = "md", className = "" }) => (
  <div className={`flex flex-wrap items-center gap-2 ${className}`}>
    {numbers.map((n, i) => (
      <Ball key={`n-${i}`} value={n} kind="main" size={size} />
    ))}
    {bonus !== undefined && (
      <>
        <span className="text-stone-400 dark:text-stone-600 text-sm px-0.5" aria-hidden>
          +
        </span>
        <Ball value={bonus} kind="bonus" size={size} />
      </>
    )}
    {stars.length > 0 && (
      <>
        <span className="text-stone-400 dark:text-stone-600 text-sm px-0.5" aria-hidden>
          +
        </span>
        {stars.map((s, i) => (
          <Ball key={`s-${i}`} value={s} kind="star" size={size} />
        ))}
      </>
    )}
  </div>
);

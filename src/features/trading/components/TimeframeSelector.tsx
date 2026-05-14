"use client";

import type { Timeframe } from "../types";

interface TimeframeSelectorProps {
  readonly timeframes: readonly Timeframe[];
  readonly selectedTimeframe: Timeframe;
  readonly onChange: (timeframe: Timeframe) => void;
}

export function TimeframeSelector({ timeframes, selectedTimeframe, onChange }: TimeframeSelectorProps) {
  return (
    <div className="flex items-end gap-2" aria-label="Select timeframe">
      {timeframes.map((timeframe) => {
        const isActive = timeframe === selectedTimeframe;

        return (
          <button
            key={timeframe}
            className={`h-11 min-w-12 rounded-md border px-3 text-sm font-semibold transition ${
              isActive
                ? "border-chart-cyan bg-chart-cyan text-chart-background"
                : "border-chart-border bg-chart-panel text-chart-muted hover:border-chart-cyan hover:text-white"
            }`}
            type="button"
            onClick={() => onChange(timeframe)}
          >
            {timeframe}
          </button>
        );
      })}
    </div>
  );
}

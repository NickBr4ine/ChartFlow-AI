"use client";

import type { CryptoAsset } from "../types";

interface CryptoSelectorProps {
  readonly assets: readonly CryptoAsset[];
  readonly selectedSymbol: string;
  readonly onChange: (symbol: string) => void;
}

export function CryptoSelector({ assets, selectedSymbol, onChange }: CryptoSelectorProps) {
  return (
    <label className="flex min-w-48 flex-col gap-2 text-sm text-chart-muted">
      Asset
      <select
        className="h-11 rounded-md border border-chart-border bg-chart-panel px-3 text-sm font-semibold text-white outline-none transition focus:border-chart-cyan"
        value={selectedSymbol}
        onChange={(event) => onChange(event.target.value)}
      >
        {assets.map((asset) => (
          <option key={asset.symbol} value={asset.symbol}>
            {asset.symbol} - {asset.name}
          </option>
        ))}
      </select>
    </label>
  );
}

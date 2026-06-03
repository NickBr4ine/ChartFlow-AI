import type { PriceLine } from "../types";

export type CryptoPriceLineKind = "market-cap" | "target-percent" | "long-liquidation" | "short-liquidation" | "manual-price";

export interface CryptoPriceLineRule {
  readonly id: string;
  readonly kind: CryptoPriceLineKind;
  readonly label: string;
  readonly marketCap?: number;
  readonly circulatingSupply?: number;
  readonly entryPrice?: number;
  readonly targetPercent?: number;
  readonly leverage?: number;
  readonly manualPrice?: number;
}

const LINE_COLORS: Record<CryptoPriceLineKind, string> = {
  "market-cap": "#7dd3fc",
  "target-percent": "#00c076",
  "long-liquidation": "#ff3b30",
  "short-liquidation": "#ff6b8a",
  "manual-price": "#f5b544"
};

export function resolveCryptoPriceLine(rule: CryptoPriceLineRule, lastPrice: number): PriceLine | null {
  const value = resolvePrice(rule, lastPrice);

  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }

  return {
    id: rule.id,
    label: rule.label.trim() || getDefaultLabel(rule.kind),
    value: Number(value.toFixed(8)),
    color: LINE_COLORS[rule.kind]
  };
}

function resolvePrice(rule: CryptoPriceLineRule, lastPrice: number): number {
  switch (rule.kind) {
    case "market-cap":
      return rule.marketCap && rule.circulatingSupply ? rule.marketCap / rule.circulatingSupply : 0;
    case "target-percent":
      return lastPrice * (1 + (rule.targetPercent ?? 0) / 100);
    case "long-liquidation":
      return rule.entryPrice && rule.leverage ? rule.entryPrice * (1 - 1 / rule.leverage) : 0;
    case "short-liquidation":
      return rule.entryPrice && rule.leverage ? rule.entryPrice * (1 + 1 / rule.leverage) : 0;
    case "manual-price":
      return rule.manualPrice ?? 0;
  }
}

function getDefaultLabel(kind: CryptoPriceLineKind): string {
  const labels: Record<CryptoPriceLineKind, string> = {
    "market-cap": "Market cap",
    "target-percent": "Alvo",
    "long-liquidation": "Liq long",
    "short-liquidation": "Liq short",
    "manual-price": "Preco"
  };

  return labels[kind];
}

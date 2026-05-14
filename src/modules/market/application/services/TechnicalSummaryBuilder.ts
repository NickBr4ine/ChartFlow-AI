import type { TechnicalSummary, Trend } from "../../domain/entities/Market";

interface TechnicalSummaryInput {
  readonly symbol: string;
  readonly timeframe: string;
  readonly lastPrice: number;
  readonly trend: Trend;
  readonly ma20: number;
  readonly ma93: number;
  readonly ma230: number;
}

export function buildTechnicalSummary(input: TechnicalSummaryInput): TechnicalSummary {
  return {
    symbol: input.symbol,
    timeframe: input.timeframe,
    lastPrice: input.lastPrice,
    trend: input.trend,
    movingAverages: {
      ma20: input.ma20,
      ma93: input.ma93,
      ma230: input.ma230
    },
    pricePosition: {
      aboveMa20: input.lastPrice > input.ma20,
      aboveMa93: input.lastPrice > input.ma93,
      aboveMa230: input.lastPrice > input.ma230
    }
  };
}

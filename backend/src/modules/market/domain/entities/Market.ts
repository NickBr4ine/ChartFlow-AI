export interface Candle {
  readonly timestamp: number;
  readonly open: number;
  readonly high: number;
  readonly low: number;
  readonly close: number;
  readonly volume: number;
}

export type Trend = "bullish" | "bearish" | "neutral";

export type RiskLevel = "low" | "medium" | "high";

export interface TechnicalSummary {
  readonly symbol: string;
  readonly timeframe: string;
  readonly lastPrice: number;
  readonly trend: Trend;
  readonly movingAverages: {
    readonly ma20: number;
    readonly ma93: number;
    readonly ma230: number;
  };
  readonly pricePosition: {
    readonly aboveMa20: boolean;
    readonly aboveMa93: boolean;
    readonly aboveMa230: boolean;
  };
}

export interface MovingAverageLine {
  readonly period: number;
  readonly values: readonly number[];
}

export interface AIInsight {
  readonly text: string;
  readonly riskLevel: RiskLevel;
  readonly disclaimer: string;
}

export interface MarketAnalysis {
  readonly symbol: string;
  readonly timeframe: string;
  readonly candles: readonly Candle[];
  readonly movingAverages: {
    readonly ma20: readonly number[];
    readonly ma93: readonly number[];
    readonly ma230: readonly number[];
    readonly lines: readonly MovingAverageLine[];
  };
  readonly summary: {
    readonly lastPrice: number;
    readonly trend: Trend;
    readonly disclaimer: string;
  };
  readonly aiInsight: AIInsight;
}

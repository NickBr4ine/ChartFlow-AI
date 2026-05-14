import type { Trend } from "../entities/Market";

export class TrendAnalyzer {
  static analyze(close: number, ma20: number, ma93: number, ma230: number): Trend {
    if (close > ma20 && ma20 > ma93 && ma93 > ma230) {
      return "bullish";
    }

    if (close < ma20 && ma20 < ma93 && ma93 < ma230) {
      return "bearish";
    }

    return "neutral";
  }
}

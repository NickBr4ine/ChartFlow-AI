import { buildTechnicalSummary } from "./TechnicalSummaryBuilder";

describe("buildTechnicalSummary", () => {
  it("builds a compact technical summary without candle arrays", () => {
    const summary = buildTechnicalSummary({
      symbol: "BTCUSDT",
      timeframe: "15m",
      lastPrice: 105,
      trend: "bullish",
      ma20: 100,
      ma93: 95,
      ma230: 90
    });

    expect(summary).toEqual({
      symbol: "BTCUSDT",
      timeframe: "15m",
      lastPrice: 105,
      trend: "bullish",
      movingAverages: {
        ma20: 100,
        ma93: 95,
        ma230: 90
      },
      pricePosition: {
        aboveMa20: true,
        aboveMa93: true,
        aboveMa230: true
      }
    });
    expect(summary).not.toHaveProperty("candles");
  });
});

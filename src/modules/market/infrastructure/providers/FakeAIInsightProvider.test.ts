import { FakeAIInsightProvider } from "./FakeAIInsightProvider";

describe("FakeAIInsightProvider", () => {
  it("returns safe educational insight without buy or sell recommendations", async () => {
    const provider = new FakeAIInsightProvider();

    const insight = await provider.generateInsight({
      symbol: "BTCUSDT",
      timeframe: "15m",
      lastPrice: 105,
      trend: "bullish",
      movingAverages: {
        ma20: 104,
        ma93: 103,
        ma230: 102
      },
      pricePosition: {
        aboveMa20: true,
        aboveMa93: true,
        aboveMa230: true
      }
    });

    expect(insight.riskLevel).toBe("low");
    expect(insight.disclaimer).toContain("educacional");
    expect(insight.text.toLowerCase()).not.toMatch(/\b(compre|venda|lucro garantido)\b/);
  });
});

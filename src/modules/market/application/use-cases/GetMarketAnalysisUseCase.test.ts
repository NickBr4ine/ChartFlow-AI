import type { Candle } from "../../domain/entities/Market";
import type { AIInsightProvider } from "../../domain/ports/AIInsightProvider";
import type { IMarketDataProvider } from "../../domain/ports/IMarketDataProvider";
import { GetMarketAnalysisUseCase } from "./GetMarketAnalysisUseCase";

function createCandles(limit: number): Candle[] {
  return Array.from({ length: limit }, (_, index) => {
    const close = index + 1;

    return {
      timestamp: index,
      open: close - 0.5,
      high: close + 1,
      low: close - 1,
      close,
      volume: 1000 + index
    };
  });
}

describe("GetMarketAnalysisUseCase", () => {
  it("orchestrates candles, moving averages, and summary", async () => {
    const provider: IMarketDataProvider = {
      fetchCandles: jest.fn().mockResolvedValue(createCandles(230))
    };
    const aiInsightProvider: AIInsightProvider = {
      generateInsight: jest.fn().mockResolvedValue({
        text: "Educational context only.",
        riskLevel: "low",
        disclaimer: "Educational only."
      })
    };
    const useCase = new GetMarketAnalysisUseCase(provider, aiInsightProvider);

    const result = await useCase.execute("BTCUSDT", "1h", 230);

    expect(provider.fetchCandles).toHaveBeenCalledWith("BTCUSDT", "1h", 230);
    expect(result.movingAverages.ma20).toHaveLength(230);
    expect(result.movingAverages.ma93).toHaveLength(230);
    expect(result.movingAverages.ma230.at(-1)).toBe(115.5);
    expect(result.summary.lastPrice).toBe(230);
    expect(result.summary.disclaimer).toContain("educacional");
    expect(aiInsightProvider.generateInsight).toHaveBeenCalledWith({
      symbol: "BTCUSDT",
      timeframe: "1h",
      lastPrice: 230,
      trend: "bullish",
      movingAverages: {
        ma20: 220.5,
        ma93: 184,
        ma230: 115.5
      },
      pricePosition: {
        aboveMa20: true,
        aboveMa93: true,
        aboveMa230: true
      }
    });
    expect(result.aiInsight).toEqual({
      text: "Educational context only.",
      riskLevel: "low",
      disclaimer: "Educational only."
    });
  });
});

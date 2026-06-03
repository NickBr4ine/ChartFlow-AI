import type { MarketAnalysis } from "./domain/entities/Market";
import { MarketController } from "./market.controller";
import type { MarketService } from "./market.service";

describe("MarketController", () => {
  it("returns market analysis with dynamic moving average lines", async () => {
    const marketService: Pick<MarketService, "getAnalysis"> = {
      getAnalysis: jest.fn().mockResolvedValue({
        symbol: "BTCUSDT",
        timeframe: "15m",
        candles: [],
        movingAverages: {
          ma20: [],
          ma93: [],
          ma230: [],
          lines: [
            { period: 20, values: [] },
            { period: 50, values: [] },
            { period: 200, values: [] }
          ]
        },
        summary: {
          lastPrice: 100,
          trend: "neutral",
          disclaimer: "Educational only."
        },
        aiInsight: {
          text: "Educational AI insight.",
          riskLevel: "medium",
          disclaimer: "Educational only."
        }
      } satisfies MarketAnalysis)
    };
    const controller = new MarketController(marketService as MarketService);

    const result = await controller.marketAnalysis({
      symbol: "BTCUSDT",
      timeframe: "15m",
      limit: "230",
      maPeriods: "20,50,200"
    });

    expect(marketService.getAnalysis).toHaveBeenCalledWith("BTCUSDT", "15m", 230, [20, 50, 200]);
    expect(result).toMatchObject({
      movingAverages: {
        lines: [{ period: 20 }, { period: 50 }, { period: 200 }]
      },
      aiInsight: {
        text: "Educational AI insight.",
        riskLevel: "medium",
        disclaimer: "Educational only."
      }
    });
  });
});

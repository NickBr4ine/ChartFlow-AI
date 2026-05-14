import Fastify from "fastify";
import type { AIInsightProvider } from "../../domain/ports/AIInsightProvider";
import type { IMarketDataProvider } from "../../domain/ports/IMarketDataProvider";
import { marketRoutes } from "./routes";

describe("marketRoutes", () => {
  it("returns aiInsight in market analysis response", async () => {
    const fastify = Fastify();
    const marketDataProvider: IMarketDataProvider = {
      fetchCandles: jest.fn().mockResolvedValue(
        Array.from({ length: 230 }, (_, index) => {
          const close = index + 1;

          return {
            timestamp: index,
            open: close - 0.5,
            high: close + 1,
            low: close - 1,
            close,
            volume: 1000 + index
          };
        })
      )
    };
    const aiInsightProvider: AIInsightProvider = {
      generateInsight: jest.fn().mockResolvedValue({
        text: "Educational AI insight.",
        riskLevel: "medium",
        disclaimer: "Educational only."
      })
    };

    await fastify.register(marketRoutes, {
      marketDataProvider,
      aiInsightProvider
    });

    const response = await fastify.inject({
      method: "GET",
      url: "/market-analysis?symbol=BTCUSDT&timeframe=15m&limit=230"
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      aiInsight: {
        text: "Educational AI insight.",
        riskLevel: "medium",
        disclaimer: "Educational only."
      }
    });
    await fastify.close();
  });
});

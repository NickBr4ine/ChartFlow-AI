import type { FastifyInstance } from "fastify";
import type { AIInsightProvider } from "../../domain/ports/AIInsightProvider";
import type { IMarketDataProvider } from "../../domain/ports/IMarketDataProvider";
import { GetMarketAnalysisUseCase } from "../../application/use-cases/GetMarketAnalysisUseCase";
import { BinanceMarketDataProvider } from "../../infrastructure/providers/BinanceMarketDataProvider";
import { FakeAIInsightProvider } from "../../infrastructure/providers/FakeAIInsightProvider";
import { OpenAIInsightProvider } from "../../infrastructure/providers/OpenAIInsightProvider";
import { MarketAnalysisQuerySchema } from "./schemas/MarketAnalysisSchema";

const ASSETS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT"] as const;
const TIMEFRAMES = ["1m", "5m", "15m", "1h", "4h", "1d"] as const;

interface MarketRoutesOptions {
  readonly marketDataProvider?: IMarketDataProvider;
  readonly aiInsightProvider?: AIInsightProvider;
}

export async function marketRoutes(fastify: FastifyInstance, options: MarketRoutesOptions = {}) {
  const provider = options.marketDataProvider ?? new BinanceMarketDataProvider();
  const aiInsightProvider = options.aiInsightProvider ?? createAIInsightProvider();
  const useCase = new GetMarketAnalysisUseCase(provider, aiInsightProvider);

  fastify.get("/health", async () => ({ status: "ok" }));

  fastify.get("/assets", async () => ASSETS);

  fastify.get("/timeframes", async () => TIMEFRAMES);

  fastify.get("/market-analysis", async (request, reply) => {
    const validation = MarketAnalysisQuerySchema.safeParse(request.query);

    if (!validation.success) {
      return reply.status(400).send({
        error: {
          code: "INVALID_MARKET_ANALYSIS_QUERY",
          message: validation.error.issues[0]?.message ?? "Invalid request query"
        }
      });
    }

    try {
      const { symbol, timeframe, limit } = validation.data;
      return await useCase.execute(symbol, timeframe, limit);
    } catch {
      return reply.status(502).send({
        error: {
          code: "MARKET_DATA_PROVIDER_ERROR",
          message: "Unable to fetch market data"
        }
      });
    }
  });
}

function createAIInsightProvider(): AIInsightProvider {
  if (process.env.OPENAI_API_KEY) {
    return new OpenAIInsightProvider({
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL
    });
  }

  return new FakeAIInsightProvider();
}

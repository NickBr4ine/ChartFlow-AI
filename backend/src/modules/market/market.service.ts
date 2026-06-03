import { Injectable } from "@nestjs/common";
import type { MarketAnalysis } from "./domain/entities/Market";
import { GetMarketAnalysisUseCase } from "./application/use-cases/GetMarketAnalysisUseCase";
import { BinanceMarketDataProvider } from "./infrastructure/providers/BinanceMarketDataProvider";
import { FakeAIInsightProvider } from "./infrastructure/providers/FakeAIInsightProvider";
import { FakeMarketDataProvider } from "./infrastructure/providers/FakeMarketDataProvider";
import { OpenAIInsightProvider } from "./infrastructure/providers/OpenAIInsightProvider";

@Injectable()
export class MarketService {
  private readonly useCase = new GetMarketAnalysisUseCase(new BinanceMarketDataProvider(), createAIInsightProvider());
  private readonly fallbackUseCase = new GetMarketAnalysisUseCase(new FakeMarketDataProvider(), createAIInsightProvider());

  async getAnalysis(
    symbol: string,
    timeframe: string,
    limit: number,
    movingAveragePeriods: readonly number[]
  ): Promise<MarketAnalysis> {
    try {
      return await this.useCase.execute(symbol, timeframe, limit, movingAveragePeriods);
    } catch (error) {
      if (process.env.NODE_ENV === "production") {
        throw error;
      }

      return this.fallbackUseCase.execute(symbol, timeframe, limit, movingAveragePeriods);
    }
  }
}

function createAIInsightProvider() {
  if (process.env.OPENAI_API_KEY) {
    return new OpenAIInsightProvider({
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL
    });
  }

  return new FakeAIInsightProvider();
}

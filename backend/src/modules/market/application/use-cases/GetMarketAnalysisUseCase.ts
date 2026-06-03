import type { MarketAnalysis } from "../../domain/entities/Market";
import type { AIInsightProvider } from "../../domain/ports/AIInsightProvider";
import type { IMarketDataProvider } from "../../domain/ports/IMarketDataProvider";
import { buildTechnicalSummary } from "../services/TechnicalSummaryBuilder";
import { calculateSMA } from "../../domain/services/IndicatorCalculator";
import { TrendAnalyzer } from "../../domain/services/TrendAnalyzer";

const DISCLAIMER = "Este sistema e apenas educacional e nao constitui recomendacao financeira.";
const DEFAULT_MOVING_AVERAGE_PERIODS = [20, 93, 230] as const;

export class GetMarketAnalysisUseCase {
  constructor(
    private readonly marketDataProvider: IMarketDataProvider,
    private readonly aiInsightProvider: AIInsightProvider
  ) {}

  async execute(
    symbol: string,
    timeframe: string,
    limit: number,
    movingAveragePeriods: readonly number[] = DEFAULT_MOVING_AVERAGE_PERIODS
  ): Promise<MarketAnalysis> {
    const candles = await this.marketDataProvider.fetchCandles(symbol, timeframe, limit);

    if (candles.length === 0) {
      throw new Error("No candles returned by market data provider");
    }

    const closePrices = candles.map((candle) => candle.close);
    const ma20 = calculateSMA(closePrices, 20);
    const ma93 = calculateSMA(closePrices, 93);
    const ma230 = calculateSMA(closePrices, 230);
    const movingAverageLines = normalizeMovingAveragePeriods(movingAveragePeriods).map((period) => ({
      period,
      values: calculateSMA(closePrices, period)
    }));
    const lastIndex = candles.length - 1;
    const lastPrice = closePrices[lastIndex];
    const trend = TrendAnalyzer.analyze(lastPrice, ma20[lastIndex], ma93[lastIndex], ma230[lastIndex]);
    const technicalSummary = buildTechnicalSummary({
      symbol,
      timeframe,
      lastPrice,
      trend,
      ma20: ma20[lastIndex],
      ma93: ma93[lastIndex],
      ma230: ma230[lastIndex]
    });
    const aiInsight = await this.aiInsightProvider.generateInsight(technicalSummary);

    return {
      symbol,
      timeframe,
      candles,
      movingAverages: { ma20, ma93, ma230, lines: movingAverageLines },
      summary: {
        lastPrice,
        trend,
        disclaimer: DISCLAIMER
      },
      aiInsight
    };
  }
}

function normalizeMovingAveragePeriods(periods: readonly number[]): number[] {
  return [...new Set(periods)].sort((left, right) => left - right);
}

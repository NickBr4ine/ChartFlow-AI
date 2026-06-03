import type { UTCTimestamp } from "lightweight-charts";
import type { AIInsight, Candle, CryptoAsset, SmaLines, Timeframe } from "../types";
import { getMovingAverageColor, normalizeMovingAveragePeriods } from "../utils/movingAverages";
import { buildMockMarketAnalysis } from "./mockMarketData";

export const CRYPTO_ASSETS: readonly CryptoAsset[] = [
  { symbol: "BTCUSDT", name: "Bitcoin", icon: "BTC", initialPrice: 104800, volatility: 0.012 },
  { symbol: "ETHUSDT", name: "Ethereum", icon: "ETH", initialPrice: 3850, volatility: 0.016 },
  { symbol: "SOLUSDT", name: "Solana", icon: "SOL", initialPrice: 188, volatility: 0.024 },
  { symbol: "BNBUSDT", name: "BNB", icon: "BNB", initialPrice: 620, volatility: 0.014 },
  { symbol: "XRPUSDT", name: "XRP", icon: "XRP", initialPrice: 0.62, volatility: 0.02 }
];

export const TIMEFRAMES: readonly Timeframe[] = ["1m", "5m", "15m", "1h", "1d"];

export interface MarketAnalysisViewModel {
  readonly candles: readonly Candle[];
  readonly smaLines: SmaLines;
  readonly lastPrice: number;
  readonly trend: "bullish" | "bearish" | "neutral";
  readonly aiInsight?: AIInsight;
  readonly isFallback: boolean;
}

interface ApiCandle {
  readonly timestamp: number;
  readonly open: number;
  readonly high: number;
  readonly low: number;
  readonly close: number;
  readonly volume: number;
}

interface ApiMarketAnalysis {
  readonly symbol: string;
  readonly timeframe: string;
  readonly candles: readonly ApiCandle[];
  readonly movingAverages: {
    readonly ma20: readonly number[];
    readonly ma93: readonly number[];
    readonly ma230: readonly number[];
    readonly lines?: readonly {
      readonly period: number;
      readonly values: readonly number[];
    }[];
  };
  readonly summary: {
    readonly lastPrice: number;
    readonly trend: "bullish" | "bearish" | "neutral";
    readonly disclaimer: string;
  };
  readonly aiInsight?: {
    readonly text: string;
    readonly riskLevel: "low" | "medium" | "high";
    readonly disclaimer: string;
  };
}

export async function fetchMarketAnalysis(
  symbol: string,
  timeframe: Timeframe,
  limit = 300,
  options: { readonly authToken?: string; readonly movingAveragePeriods?: readonly number[] } = {}
): Promise<MarketAnalysisViewModel> {
  try {
    const params = new URLSearchParams({
      symbol,
      timeframe,
      limit: String(limit)
    });
    const movingAveragePeriods = normalizeMovingAveragePeriods(options.movingAveragePeriods);

    if (movingAveragePeriods.length > 0) {
      params.set("maPeriods", movingAveragePeriods.join(","));
    }

    const response = await fetch(`/api/market-analysis?${params.toString()}`, {
      headers: {
        Accept: "application/json",
        ...(options.authToken ? { Authorization: `Bearer ${options.authToken}` } : {})
      },
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Market analysis request failed with status ${response.status}`);
    }

    const analysis = (await response.json()) as ApiMarketAnalysis;
    return toViewModel(analysis, false);
  } catch (error) {
    if (import.meta.env.PROD) {
      throw error;
    }

    const asset = CRYPTO_ASSETS.find((candidate) => candidate.symbol === symbol) ?? CRYPTO_ASSETS[0];
    return buildMockMarketAnalysis(asset, timeframe, limit, options.movingAveragePeriods);
  }
}

function toViewModel(analysis: ApiMarketAnalysis, isFallback: boolean): MarketAnalysisViewModel {
  const candles = analysis.candles.map((candle) => ({
    time: Math.floor(candle.timestamp / 1000) as UTCTimestamp,
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
    volume: candle.volume
  }));

  return {
    candles,
    smaLines: toMovingAverageLines(candles, analysis.movingAverages),
    lastPrice: analysis.summary.lastPrice,
    trend: analysis.summary.trend,
    aiInsight: sanitizeAIInsight(analysis.aiInsight),
    isFallback
  };
}

function toMovingAverageLines(
  candles: readonly Candle[],
  movingAverages: ApiMarketAnalysis["movingAverages"]
): SmaLines {
  const dynamicLines = movingAverages.lines?.length
    ? movingAverages.lines
    : [
        { period: 20, values: movingAverages.ma20 },
        { period: 93, values: movingAverages.ma93 },
        { period: 230, values: movingAverages.ma230 }
      ];

  return dynamicLines.map((line) => ({
    period: line.period,
    color: getMovingAverageColor(line.period),
    points: toSmaPoints(candles, line.values)
  }));
}

function sanitizeAIInsight(insight: ApiMarketAnalysis["aiInsight"]): AIInsight | undefined {
  if (!insight) {
    return undefined;
  }

  return {
    text: sanitizeEducationalText(insight.text),
    riskLevel: insight.riskLevel,
    disclaimer: sanitizeEducationalText(insight.disclaimer)
  };
}

function sanitizeEducationalText(text: string): string {
  return text
    .replace(/\b(compre|comprar|venda|vender|buy|sell|lucro garantido|garantia de lucro)\b/gi, "analise com cautela")
    .trim();
}

function toSmaPoints(candles: readonly Candle[], values: readonly number[]) {
  return values
    .map((value, index) => ({
      time: candles[index]?.time,
      value
    }))
    .filter((point): point is { readonly time: Candle["time"]; readonly value: number } => Boolean(point.time) && point.value > 0);
}

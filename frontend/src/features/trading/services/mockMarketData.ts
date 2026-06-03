import type { UTCTimestamp } from "lightweight-charts";
import type { Candle, CryptoAsset, SmaLines, Timeframe } from "../types";
import { getMovingAverageColor, normalizeMovingAveragePeriods } from "../utils/movingAverages";
import type { MarketAnalysisViewModel } from "./marketAnalysisService";

const TIMEFRAME_SECONDS: Record<Timeframe, number> = {
  "1m": 60,
  "5m": 300,
  "15m": 900,
  "1h": 3600,
  "1d": 86400
};

function createSeed(input: string): number {
  return [...input].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 2166136261);
}

function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function generateMockCandles(asset: CryptoAsset, timeframe: Timeframe, limit = 320): Candle[] {
  const random = seededRandom(createSeed(`${asset.symbol}-${timeframe}`));
  const interval = TIMEFRAME_SECONDS[timeframe];
  const baseTime = 1767225600 - limit * interval;
  const candles: Candle[] = [];
  let price = asset.initialPrice;

  for (let index = 0; index < limit; index += 1) {
    const drift = Math.sin(index / 24) * asset.volatility * 0.45;
    const shock = (random() - 0.5) * asset.volatility;
    const open = price;
    const close = Math.max(open * (1 + drift + shock), 0.0001);
    const high = Math.max(open, close) * (1 + random() * asset.volatility * 0.6);
    const low = Math.min(open, close) * (1 - random() * asset.volatility * 0.6);
    const volume = 1000 + random() * 9000;

    candles.push({
      time: (baseTime + index * interval) as UTCTimestamp,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: Number(volume.toFixed(2))
    });

    price = close;
  }

  return candles;
}

export function buildMockMarketAnalysis(
  asset: CryptoAsset,
  timeframe: Timeframe,
  limit = 300,
  movingAveragePeriods: readonly number[] | undefined = [20, 93, 230]
): MarketAnalysisViewModel {
  const candles = generateMockCandles(asset, timeframe, limit);
  const smaLines = buildSmaLines(candles, movingAveragePeriods);
  const lastPrice = candles.at(-1)?.close ?? asset.initialPrice;

  return {
    candles,
    smaLines,
    lastPrice,
    trend: "neutral",
    aiInsight: {
      text: "Fallback educacional de desenvolvimento. A leitura considera apenas candles simulados e medias moveis simples.",
      riskLevel: "medium",
      disclaimer: "Conteudo educacional. Nao e recomendacao de compra, venda ou garantia de resultado."
    },
    isFallback: true
  };
}

function buildSmaLines(candles: readonly Candle[], movingAveragePeriods: readonly number[]): SmaLines {
  return normalizeMovingAveragePeriods(movingAveragePeriods).map((period) => ({
    period,
    color: getMovingAverageColor(period),
    points: calculateSmaPoints(candles, period)
  }));
}

function calculateSmaPoints(candles: readonly Candle[], period: number) {
  return candles
    .map((candle, index) => {
      if (index < period - 1) {
        return null;
      }

      const window = candles.slice(index - period + 1, index + 1);
      const sum = window.reduce((total, current) => total + current.close, 0);

      return {
        time: candle.time,
        value: Number((sum / period).toFixed(2))
      };
    })
    .filter((point): point is { readonly time: Candle["time"]; readonly value: number } => point !== null);
}

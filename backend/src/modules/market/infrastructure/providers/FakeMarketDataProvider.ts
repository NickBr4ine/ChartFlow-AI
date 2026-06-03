import type { Candle } from "../../domain/entities/Market";
import type { IMarketDataProvider } from "../../domain/ports/IMarketDataProvider";

const TIMEFRAME_SECONDS: Record<string, number> = {
  "1m": 60,
  "5m": 300,
  "15m": 900,
  "1h": 3600,
  "4h": 14400,
  "1d": 86400
};

const INITIAL_PRICES: Record<string, number> = {
  BTCUSDT: 104800,
  ETHUSDT: 3850,
  SOLUSDT: 188,
  BNBUSDT: 620,
  XRPUSDT: 0.62
};

const VOLATILITY: Record<string, number> = {
  BTCUSDT: 0.012,
  ETHUSDT: 0.016,
  SOLUSDT: 0.024,
  BNBUSDT: 0.014,
  XRPUSDT: 0.02
};

export class FakeMarketDataProvider implements IMarketDataProvider {
  async fetchCandles(symbol: string, interval: string, limit: number): Promise<readonly Candle[]> {
    return generateCandles(symbol, interval, limit);
  }
}

function generateCandles(symbol: string, interval: string, limit: number): Candle[] {
  const random = seededRandom(createSeed(`${symbol}-${interval}`));
  const intervalSeconds = TIMEFRAME_SECONDS[interval] ?? TIMEFRAME_SECONDS["15m"];
  const baseTime = (Date.now() - limit * intervalSeconds * 1000) / 1000;
  const candles: Candle[] = [];
  let price = INITIAL_PRICES[symbol] ?? 100;
  const volatility = VOLATILITY[symbol] ?? 0.014;

  for (let index = 0; index < limit; index += 1) {
    const drift = Math.sin(index / 24) * volatility * 0.45;
    const shock = (random() - 0.5) * volatility;
    const open = price;
    const close = Math.max(open * (1 + drift + shock), 0.0001);
    const high = Math.max(open, close) * (1 + random() * volatility * 0.6);
    const low = Math.min(open, close) * (1 - random() * volatility * 0.6);

    candles.push({
      timestamp: Math.floor((baseTime + index * intervalSeconds) * 1000),
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: Number((1000 + random() * 9000).toFixed(2))
    });

    price = close;
  }

  return candles;
}

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

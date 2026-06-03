import type { Candle } from "../entities/Market";

export interface IMarketDataProvider {
  fetchCandles(symbol: string, interval: string, limit: number): Promise<readonly Candle[]>;
}

import axios from "axios";
import type { Candle } from "../../domain/entities/Market";
import type { IMarketDataProvider } from "../../domain/ports/IMarketDataProvider";

type BinanceKline = [
  openTime: number,
  open: string,
  high: string,
  low: string,
  close: string,
  volume: string,
  ...rest: unknown[]
];

export class BinanceMarketDataProvider implements IMarketDataProvider {
  private readonly baseUrl = "https://api.binance.com/api/v3/klines";

  async fetchCandles(symbol: string, interval: string, limit: number): Promise<readonly Candle[]> {
    const response = await axios.get<BinanceKline[]>(this.baseUrl, {
      params: { symbol, interval, limit },
      timeout: 8000
    });

    return response.data.map((raw) => ({
      timestamp: raw[0],
      open: Number(raw[1]),
      high: Number(raw[2]),
      low: Number(raw[3]),
      close: Number(raw[4]),
      volume: Number(raw[5])
    }));
  }
}

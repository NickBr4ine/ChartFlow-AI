import { z } from "zod";

export const MarketAnalysisQuerySchema = z.object({
  symbol: z.enum(["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT"]),
  timeframe: z.enum(["1m", "5m", "15m", "1h", "4h", "1d"]),
  limit: z.coerce.number().int().min(230).max(1000).default(300)
});

export type MarketAnalysisQuery = z.infer<typeof MarketAnalysisQuerySchema>;

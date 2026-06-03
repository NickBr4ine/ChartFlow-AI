import { z } from "zod";

const DEFAULT_MOVING_AVERAGE_PERIODS = [20, 93, 230] as const;

const MovingAveragePeriodsSchema = z
  .preprocess((value) => {
    if (value === undefined) {
      return undefined;
    }

    const rawValue = Array.isArray(value) ? value.join(",") : String(value);
    return rawValue
      .split(",")
      .map((period) => Number(period.trim()))
      .filter((period) => Number.isFinite(period));
  }, z.array(z.number().int().min(2).max(500)).min(1).max(6).optional())
  .transform((periods) => [...new Set(periods ?? DEFAULT_MOVING_AVERAGE_PERIODS)].sort((left, right) => left - right));

export const MarketAnalysisQuerySchema = z.object({
  symbol: z.enum(["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT"]),
  timeframe: z.enum(["1m", "5m", "15m", "1h", "4h", "1d"]),
  limit: z.coerce.number().int().min(230).max(1000).default(300),
  maPeriods: MovingAveragePeriodsSchema
}).superRefine((query, context) => {
  const periodAboveLimit = query.maPeriods.find((period) => period > query.limit);

  if (periodAboveLimit) {
    context.addIssue({
      code: "custom",
      path: ["maPeriods"],
      message: `Moving average period ${periodAboveLimit} cannot be greater than limit ${query.limit}`
    });
  }
});

export type MarketAnalysisQuery = z.infer<typeof MarketAnalysisQuerySchema>;

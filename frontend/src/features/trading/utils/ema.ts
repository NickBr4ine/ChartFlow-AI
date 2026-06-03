import type { Candle, EmaPoint, IndicatorSummary, MovingAveragePeriod } from "../types";

const PERIOD_LABELS: Record<number, string> = {
  20: "SMA 20",
  93: "SMA 93",
  230: "SMA 230"
};

const PERIOD_DESCRIPTIONS: Record<number, string> = {
  20: "Momentum imediato",
  93: "Zona de equilibrio",
  230: "Tendencia institucional"
};

export function calculateEMA(candles: readonly Candle[], period: MovingAveragePeriod): EmaPoint[] {
  if (candles.length === 0) {
    return [];
  }

  const multiplier = 2 / (period + 1);
  let previousEma = candles[0].close;

  return candles.map((candle, index) => {
    const value = index === 0 ? previousEma : (candle.close - previousEma) * multiplier + previousEma;
    previousEma = value;

    return {
      time: candle.time,
      value: Number(value.toFixed(2))
    };
  });
}

export function getLatestEmaValue(points: readonly EmaPoint[]): number {
  return points.at(-1)?.value ?? 0;
}

export function buildIndicatorSummary(
  lastPrice: number,
  period: MovingAveragePeriod,
  average: number
): IndicatorSummary {
  const relation = lastPrice > average ? "above" : lastPrice < average ? "below" : "equal";
  const direction = relation === "above" ? "Tendencia de Alta" : relation === "below" ? "Tendencia de Baixa" : "Neutro";

  return {
    period,
    label: PERIOD_LABELS[period] ?? `SMA ${period}`,
    average,
    relation,
    description: `${direction} - ${PERIOD_DESCRIPTIONS[period] ?? "Media customizada"}`
  };
}

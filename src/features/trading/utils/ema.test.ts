import type { Time } from "lightweight-charts";
import type { Candle } from "../types";
import { buildIndicatorSummary, calculateEMA } from "./ema";

const candles: Candle[] = [
  { time: 1 as Time, open: 10, high: 11, low: 9, close: 10, volume: 100 },
  { time: 2 as Time, open: 10, high: 12, low: 9, close: 12, volume: 110 },
  { time: 3 as Time, open: 12, high: 13, low: 11, close: 11, volume: 120 }
];

describe("calculateEMA", () => {
  it("calculates EMA values using the previous EMA", () => {
    expect(calculateEMA(candles, 20)).toEqual([
      { time: 1 as Time, value: 10 },
      { time: 2 as Time, value: 10.19 },
      { time: 3 as Time, value: 10.27 }
    ]);
  });
});

describe("buildIndicatorSummary", () => {
  it("marks price above the moving average as bullish context", () => {
    expect(buildIndicatorSummary(105, 20, 100).relation).toBe("above");
  });
});

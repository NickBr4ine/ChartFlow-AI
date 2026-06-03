import { calculateSMA } from "./IndicatorCalculator";

describe("calculateSMA", () => {
  it("returns zero until enough data exists for the period", () => {
    expect(calculateSMA([1, 2, 3, 4, 5], 3)).toEqual([0, 0, 2, 3, 4]);
  });

  it("rejects invalid periods", () => {
    expect(() => calculateSMA([1, 2, 3], 0)).toThrow("SMA period must be greater than zero");
  });
});

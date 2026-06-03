import { TrendAnalyzer } from "./TrendAnalyzer";

describe("TrendAnalyzer", () => {
  it("detects bullish alignment", () => {
    expect(TrendAnalyzer.analyze(110, 100, 90, 80)).toBe("bullish");
  });

  it("detects bearish alignment", () => {
    expect(TrendAnalyzer.analyze(70, 80, 90, 100)).toBe("bearish");
  });

  it("returns neutral for mixed alignment", () => {
    expect(TrendAnalyzer.analyze(100, 90, 95, 80)).toBe("neutral");
  });
});

"use client";

import { useEffect, useMemo, useState } from "react";
import { buildIndicatorSummary, getLatestEmaValue } from "../utils/ema";
import { CRYPTO_ASSETS, TIMEFRAMES, fetchMarketAnalysis } from "../services/marketAnalysisService";
import type { AIInsight, Candle, SmaLines, Timeframe } from "../types";
import { AIInsightCard } from "./AIInsightCard";
import { CryptoSelector } from "./CryptoSelector";
import { DisclaimerBanner } from "./DisclaimerBanner";
import { ErrorState } from "./ErrorState";
import { IndicatorCard } from "./IndicatorCard";
import { LoadingState } from "./LoadingState";
import { MarketSummary } from "./MarketSummary";
import { TimeframeSelector } from "./TimeframeSelector";
import { TradingChart } from "./TradingChart";

interface MarketState {
  readonly candles: readonly Candle[];
  readonly smaLines: SmaLines;
  readonly lastPrice: number;
  readonly aiInsight?: AIInsight;
  readonly isFallback: boolean;
}

export function TradingDashboard() {
  const [selectedSymbol, setSelectedSymbol] = useState(CRYPTO_ASSETS[0].symbol);
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>("15m");
  const [marketState, setMarketState] = useState<MarketState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedAsset = useMemo(
    () => CRYPTO_ASSETS.find((asset) => asset.symbol === selectedSymbol) ?? CRYPTO_ASSETS[0],
    [selectedSymbol]
  );

  const clearMarketState = () => {
    setMarketState(null);
    setError(null);
  };

  const handleSymbolChange = (symbol: string) => {
    clearMarketState();
    setSelectedSymbol(symbol);
  };

  const handleTimeframeChange = (timeframe: Timeframe) => {
    clearMarketState();
    setSelectedTimeframe(timeframe);
  };

  useEffect(() => {
    const controller = new AbortController();

    async function loadMarketAnalysis() {
      try {
        const marketAnalysis = await fetchMarketAnalysis(selectedAsset.symbol, selectedTimeframe, 300);

        if (!controller.signal.aborted) {
          setMarketState(marketAnalysis);
        }
      } catch {
        if (!controller.signal.aborted) {
          setError("Unable to load real market data.");
        }
      }
    }

    void loadMarketAnalysis();

    return () => controller.abort();
  }, [selectedAsset, selectedTimeframe]);

  const lastPrice = marketState?.lastPrice ?? selectedAsset.initialPrice;
  const firstPrice = marketState?.candles.at(0)?.open ?? selectedAsset.initialPrice;
  const changePercent = ((lastPrice - firstPrice) / firstPrice) * 100;
  const indicators = marketState
    ? [
        buildIndicatorSummary(lastPrice, 20, getLatestEmaValue(marketState.smaLines.sma20)),
        buildIndicatorSummary(lastPrice, 93, getLatestEmaValue(marketState.smaLines.sma93)),
        buildIndicatorSummary(lastPrice, 230, getLatestEmaValue(marketState.smaLines.sma230))
      ]
    : [];

  return (
    <main className="min-h-screen bg-chart-background text-white">
      <header className="sticky top-0 z-20 border-b border-chart-border bg-chart-background/95 px-5 py-4 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-chart-cyan">ChartFlow AI</p>
            <h1 className="mt-1 text-2xl font-semibold text-white">Crypto Market Analysis</h1>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <CryptoSelector assets={CRYPTO_ASSETS} selectedSymbol={selectedSymbol} onChange={handleSymbolChange} />
            <TimeframeSelector
              timeframes={TIMEFRAMES}
              selectedTimeframe={selectedTimeframe}
              onChange={handleTimeframeChange}
            />
          </div>
        </div>
      </header>

      <MarketSummary asset={selectedAsset} lastPrice={lastPrice} changePercent={changePercent} />

      <section className="grid min-h-[620px] grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="border-b border-chart-border lg:border-b-0 lg:border-r">
          {error ? <ErrorState message={error} /> : null}
          {!error && !marketState ? <LoadingState /> : null}
          {!error && marketState ? <TradingChart candles={marketState.candles} smaLines={marketState.smaLines} /> : null}
        </div>

        <aside className="space-y-4 p-5">
          <div>
            <p className="text-xs uppercase text-chart-muted">Indicator State</p>
            <h2 className="mt-1 text-lg font-semibold text-white">SMA Momentum</h2>
            {marketState?.isFallback ? (
              <p className="mt-2 text-sm text-chart-amber">Using development fallback data.</p>
            ) : null}
          </div>
          {indicators.map((indicator) => (
            <IndicatorCard key={indicator.period} indicator={indicator} />
          ))}
          <AIInsightCard insight={marketState?.aiInsight} />
        </aside>
      </section>

      <DisclaimerBanner />
    </main>
  );
}

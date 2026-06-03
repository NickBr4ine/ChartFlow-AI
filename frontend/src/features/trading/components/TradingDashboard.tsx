"use client";

import { useEffect, useMemo, useState } from "react";
import { buildIndicatorSummary, getLatestEmaValue } from "../utils/ema";
import { CRYPTO_ASSETS, TIMEFRAMES, fetchMarketAnalysis } from "../services/marketAnalysisService";
import { resolveCryptoPriceLine, type CryptoPriceLineRule } from "../utils/cryptoPriceLines";
import type { AIInsight, Candle, PriceLine, SmaLines, Timeframe } from "../types";
import { AIInsightCard } from "./AIInsightCard";
import { CryptoSelector } from "./CryptoSelector";
import { DisclaimerBanner } from "./DisclaimerBanner";
import { ErrorState } from "./ErrorState";
import { IndicatorCard } from "./IndicatorCard";
import { LineAutomationPanel } from "./LineAutomationPanel";
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

interface TradingDashboardProps {
  readonly authToken: string;
  readonly userName: string;
  readonly onLogout: () => void;
}

const DEFAULT_MOVING_AVERAGE_PERIODS = [20, 93, 230] as const;

export function TradingDashboard({ authToken, userName, onLogout }: TradingDashboardProps) {
  const [selectedSymbol, setSelectedSymbol] = useState(CRYPTO_ASSETS[0].symbol);
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>("15m");
  const [movingAveragePeriods, setMovingAveragePeriods] = useState<readonly number[]>(DEFAULT_MOVING_AVERAGE_PERIODS);
  const [priceLineRules, setPriceLineRules] = useState<readonly CryptoPriceLineRule[]>([]);
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

  const handleMovingAveragePeriodsChange = (periods: readonly number[]) => {
    clearMarketState();
    setMovingAveragePeriods(periods);
  };

  useEffect(() => {
    const controller = new AbortController();

    async function loadMarketAnalysis() {
      try {
        const marketAnalysis = await fetchMarketAnalysis(selectedAsset.symbol, selectedTimeframe, 300, {
          authToken,
          movingAveragePeriods
        });

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
  }, [authToken, movingAveragePeriods, selectedAsset, selectedTimeframe]);

  const lastPrice = marketState?.lastPrice ?? selectedAsset.initialPrice;
  const firstPrice = marketState?.candles.at(0)?.open ?? selectedAsset.initialPrice;
  const changePercent = ((lastPrice - firstPrice) / firstPrice) * 100;
  const indicators = marketState
    ? marketState.smaLines.map((line) => buildIndicatorSummary(lastPrice, line.period, getLatestEmaValue(line.points)))
    : [];
  const priceLines = useMemo(
    () => priceLineRules.map((rule) => resolveCryptoPriceLine(rule, lastPrice)).filter((line): line is PriceLine => line !== null),
    [lastPrice, priceLineRules]
  );

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
            <button
              type="button"
              onClick={onLogout}
              className="h-10 rounded-md border border-chart-border px-3 text-sm font-semibold text-chart-muted"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <MarketSummary asset={selectedAsset} lastPrice={lastPrice} changePercent={changePercent} />

      <section className="flex ">
       

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
          <LineAutomationPanel
            lastPrice={lastPrice}
            movingAveragePeriods={movingAveragePeriods}
            priceLineRules={priceLineRules}
            onMovingAveragePeriodsChange={handleMovingAveragePeriodsChange}
            onPriceLineRulesChange={setPriceLineRules}
          />
          <AIInsightCard insight={marketState?.aiInsight} />
        </aside>
      </section>
 <div className="border-b border-chart-border lg:border-b-0 lg:border-r">
          {error ? <ErrorState message={error} /> : null}
          {!error && !marketState ? <LoadingState /> : null}
          {!error && marketState ? (
            <TradingChart candles={marketState.candles} smaLines={marketState.smaLines} priceLines={priceLines} />
          ) : null}
        </div>
      <DisclaimerBanner />
    </main>
  );
}

import type { CryptoAsset } from "../types";

interface MarketSummaryProps {
  readonly asset: CryptoAsset;
  readonly lastPrice: number;
  readonly changePercent: number;
}

export function MarketSummary({ asset, lastPrice, changePercent }: MarketSummaryProps) {
  const isPositive = changePercent >= 0;

  return (
    <section className="grid gap-3 border-b border-chart-border px-5 py-4 sm:grid-cols-3">
      <div>
        <p className="text-xs uppercase text-chart-muted">Selected Market</p>
        <h2 className="mt-1 text-xl font-semibold text-white">{asset.symbol}</h2>
      </div>
      <div>
        <p className="text-xs uppercase text-chart-muted">Last Price</p>
        <p className="mt-1 text-xl font-semibold text-white">
          {lastPrice.toLocaleString("en-US", { style: "currency", currency: "USD" })}
        </p>
      </div>
      <div>
        <p className="text-xs uppercase text-chart-muted">24h Change</p>
        <p className={`mt-1 text-xl font-semibold ${isPositive ? "text-chart-green" : "text-chart-red"}`}>
          {isPositive ? "+" : ""}
          {changePercent.toFixed(2)}%
        </p>
      </div>
    </section>
  );
}

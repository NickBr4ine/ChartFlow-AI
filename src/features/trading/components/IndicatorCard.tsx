import type { IndicatorSummary } from "../types";

interface IndicatorCardProps {
  readonly indicator: IndicatorSummary;
}

export function IndicatorCard({ indicator }: IndicatorCardProps) {
  const tone =
    indicator.relation === "above"
      ? "border-chart-green text-chart-green"
      : indicator.relation === "below"
        ? "border-chart-red text-chart-red"
        : "border-chart-amber text-chart-amber";

  return (
    <article className="rounded-md border border-chart-border bg-chart-panel p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-white">{indicator.label}</h3>
        <span className={`rounded border px-2 py-1 text-xs font-semibold ${tone}`}>
          {indicator.relation.toUpperCase()}
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold text-white">{indicator.average.toFixed(2)}</p>
      <p className="mt-2 text-sm text-chart-muted">{indicator.description}</p>
    </article>
  );
}

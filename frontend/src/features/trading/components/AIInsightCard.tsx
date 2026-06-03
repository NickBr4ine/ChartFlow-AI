import type { AIInsight, RiskLevel } from "../types";

interface AIInsightCardProps {
  readonly insight?: AIInsight;
}

const RISK_LABELS: Record<RiskLevel, string> = {
  low: "Low Risk",
  medium: "Medium Risk",
  high: "High Risk"
};

const RISK_STYLES: Record<RiskLevel, string> = {
  low: "border-chart-green text-chart-green",
  medium: "border-chart-amber text-chart-amber",
  high: "border-chart-red text-chart-red"
};

export function AIInsightCard({ insight }: AIInsightCardProps) {
  return (
    <section className="rounded-md border border-chart-border bg-chart-panel p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase text-chart-muted">AI Insight</p>
          <h3 className="mt-1 text-sm font-semibold text-white">Educational Context</h3>
        </div>
        {insight ? (
          <span className={`rounded border px-2 py-1 text-xs font-semibold ${RISK_STYLES[insight.riskLevel]}`}>
            {RISK_LABELS[insight.riskLevel]}
          </span>
        ) : null}
      </div>

      <p className="mt-3 text-sm leading-6 text-chart-muted">
        {insight?.text ??
          "AI insight is unavailable for this market response. Continue using the chart and SMA context for educational analysis."}
      </p>

      <p className="mt-3 border-t border-chart-border pt-3 text-xs leading-5 text-chart-amber">
        {insight?.disclaimer ??
          "Educational content only. This dashboard does not provide investment advice, order instructions, or profit guarantees."}
      </p>
    </section>
  );
}

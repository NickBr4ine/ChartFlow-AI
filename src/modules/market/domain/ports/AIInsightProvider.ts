import type { AIInsight, TechnicalSummary } from "../entities/Market";

export interface AIInsightProvider {
  generateInsight(summary: TechnicalSummary): Promise<AIInsight>;
}

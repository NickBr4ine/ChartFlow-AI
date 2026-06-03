import type { AIInsight, RiskLevel, TechnicalSummary } from "../../domain/entities/Market";
import type { AIInsightProvider } from "../../domain/ports/AIInsightProvider";

const DISCLAIMER = "Conteudo educacional. Nao e recomendacao de compra, venda ou garantia de resultado.";

export class FakeAIInsightProvider implements AIInsightProvider {
  async generateInsight(summary: TechnicalSummary): Promise<AIInsight> {
    const riskLevel = this.calculateRiskLevel(summary);
    const positionText = this.describePricePosition(summary);

    return {
      text: [
        `Cenario educacional para ${summary.symbol} no timeframe ${summary.timeframe}.`,
        `A tendencia tecnica agregada esta classificada como ${summary.trend}.`,
        `O preco atual esta ${positionText} em relacao as medias SMA 20, SMA 93 e SMA 230.`,
        "Use esta leitura para estudar contexto, momentum e pontos de atencao, sem tratar o texto como ordem operacional."
      ].join(" "),
      riskLevel,
      disclaimer: DISCLAIMER
    };
  }

  private calculateRiskLevel(summary: TechnicalSummary): RiskLevel {
    const { ma20, ma93, ma230 } = summary.movingAverages;
    const spread = Math.abs(ma20 - ma230) / Math.max(summary.lastPrice, 1);

    if (summary.trend === "neutral" || spread > 0.04) {
      return "high";
    }

    if (Math.abs(ma20 - ma93) / Math.max(summary.lastPrice, 1) > 0.015) {
      return "medium";
    }

    return "low";
  }

  private describePricePosition(summary: TechnicalSummary): string {
    const positions = [
      summary.pricePosition.aboveMa20,
      summary.pricePosition.aboveMa93,
      summary.pricePosition.aboveMa230
    ];
    const aboveCount = positions.filter(Boolean).length;

    if (aboveCount === 3) {
      return "acima das tres medias";
    }

    if (aboveCount === 0) {
      return "abaixo das tres medias";
    }

    return "entre as medias principais";
  }
}

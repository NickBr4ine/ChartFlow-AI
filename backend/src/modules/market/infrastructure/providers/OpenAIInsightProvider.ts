import type { AIInsight, RiskLevel, TechnicalSummary } from "../../domain/entities/Market";
import type { AIInsightProvider } from "../../domain/ports/AIInsightProvider";
import { FakeAIInsightProvider } from "./FakeAIInsightProvider";

const SAFE_SYSTEM_PROMPT =
  "Voce e um assistente educacional de analise tecnica. Explique o cenario com base nos indicadores, sem recomendar compra ou venda.";

const DISCLAIMER = "Conteudo educacional. Nao e recomendacao de compra, venda ou garantia de resultado.";

interface OpenAIInsightProviderConfig {
  readonly apiKey?: string;
  readonly model?: string;
  readonly endpoint?: string;
}

interface OpenAITextResponse {
  readonly output_text?: string;
}

export class OpenAIInsightProvider implements AIInsightProvider {
  private readonly fallback = new FakeAIInsightProvider();
  private readonly apiKey?: string;
  private readonly model: string;
  private readonly endpoint: string;

  constructor(config: OpenAIInsightProviderConfig = {}) {
    this.apiKey = config.apiKey;
    this.model = config.model ?? "gpt-4.1-mini";
    this.endpoint = config.endpoint ?? "https://api.openai.com/v1/responses";
  }

  async generateInsight(summary: TechnicalSummary): Promise<AIInsight> {
    if (!this.apiKey) {
      return this.fallback.generateInsight(summary);
    }

    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: this.model,
          input: [
            {
              role: "system",
              content: SAFE_SYSTEM_PROMPT
            },
            {
              role: "user",
              content: this.buildUserPrompt(summary)
            }
          ]
        })
      });

      if (!response.ok) {
        return this.fallback.generateInsight(summary);
      }

      const data = (await response.json()) as OpenAITextResponse;
      const text = this.sanitizeText(data.output_text);

      if (!text) {
        return this.fallback.generateInsight(summary);
      }

      return {
        text,
        riskLevel: this.calculateRiskLevel(summary),
        disclaimer: DISCLAIMER
      };
    } catch {
      return this.fallback.generateInsight(summary);
    }
  }

  private buildUserPrompt(summary: TechnicalSummary): string {
    return [
      "Gere uma explicacao curta e educacional com base apenas neste resumo tecnico.",
      "Nao recomende compra, venda, entrada, saida, alavancagem ou promessa de lucro.",
      `Resumo: ${JSON.stringify(summary)}`
    ].join("\n");
  }

  private sanitizeText(text?: string): string {
    if (!text) {
      return "";
    }

    return text
      .replace(/\b(compre|comprar|venda|vender|lucro garantido|garantia de lucro)\b/gi, "analise com cautela")
      .trim();
  }

  private calculateRiskLevel(summary: TechnicalSummary): RiskLevel {
    if (summary.trend === "neutral") {
      return "high";
    }

    const spread = Math.abs(summary.movingAverages.ma20 - summary.movingAverages.ma230) / Math.max(summary.lastPrice, 1);
    return spread > 0.025 ? "medium" : "low";
  }
}

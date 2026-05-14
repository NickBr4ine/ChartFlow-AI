Este é um prompt estruturado e detalhado, fundamentado nas pesquisas e especificações técnicas de mercado para o desenvolvimento do front-end do seu MVP de auxílio ao Day Trade.

---

# Prompt para IA Desenvolvedora: Front-End de Ecossistema de Análise de Criptoativos

## 1. Objetivo do Projeto
Desenvolver o front-end de um MVP (Produto Mínimo Viável) para uma plataforma de análise técnica de criptoativos. O foco é fornecer uma ferramenta visual profissional onde o usuário possa analisar o momentum de mercado através de candles OHLC e Médias Móveis Exponenciais (EMA) de 20, 93 e 230 períodos. O sistema é estritamente de auxílio visual: a decisão final é sempre do usuário e não há execução de ordens.

## 2. Stack Tecnológica
- **Linguagem:** TypeScript (estrita para segurança de tipos).
- **Framework:** Next.js (App Router) ou React.
- **Gráficos:** TradingView Lightweight Charts (escolhida pela alta performance e foco em séries temporais financeiras).
- **Estilização:** Tailwind CSS (foco em tema escuro profissional).
- **Gerenciamento de Estado:** React Hooks (useState, useEffect, useMemo).

## 3. Estrutura de Pastas e Arquitetura
Siga uma organização modular e inspirada em Clean Architecture:
- `src/components`: Componentes genéricos de UI (botões, seletores).
- `src/features/trading`: Domínio principal da aplicação.
    - `/components`: `TradingChart`, `IndicatorCard`, `MarketSummary`.
    - `/types`: Definições TypeScript.
    - `/utils`: Funções matemáticas para cálculo de EMA.
    - `/services`: Simulação de data fetching (preparado para futura conexão com WebSocket/REST da Binance).
- `src/app`: Páginas principais.

## 4. Tipagens TypeScript Necessárias
Crie as seguintes interfaces para garantir a integridade dos dados:
- **Candle:** `time: number | string`, `open`, `high`, `low`, `close`, `volume` (todos como `number`).
- **CryptoAsset:** `symbol`, `name`, `icon`.
- **MovingAverage:** `period` (20, 93, 230), `color`, `value`.
- **IndicatorSummary:** Resumo do estado atual (preço acima/abaixo da média).

## 5. Componentes a Desenvolver
1.  **CryptoSelector:** Dropdown para selecionar entre 5 pares principais (ex: BTC/USDT, ETH/USDT).
2.  **TimeframeSelector:** Botões para trocar intervalos (1m, 5m, 15m, 1h, 1d).
3.  **TradingChart:** O coração da aplicação usando `lightweight-charts`.
    - Deve renderizar a série de Candlesticks.
    - Deve renderizar três séries de linha (LineSeries) para as EMAs.
    - Implementar tooltip customizado que exiba os valores de todas as EMAs ao passar o mouse.
4.  **IndicatorCard:** Card lateral que indica se o preço atual está em "Tendência de Alta" (acima da média) ou "Tendência de Baixa" (abaixo da média) para cada um dos 3 períodos.
5.  **MarketSummary:** Visão geral do ativo selecionado (Preço atual, variação 24h).
6.  **LoadingState & ErrorState:** Feedbacks visuais profissionais durante o carregamento de dados.

## 6. Regras de Negócio e Lógica Matemática
- **Cálculo de EMA:** Implementar a fórmula da EMA que atribui mais peso aos dados recentes para agilidade no Day Trade.
    - Multiplicador ($\alpha$) = $2 / (n + 1)$.
    - EMA atual = $(Preço - EMA_{anterior}) \times \alpha + EMA_{anterior}$.
- **Hierarquia de Tendência:**
    - **EMA 20:** Momentum imediato (curto prazo).
    - **EMA 93:** Zona de equilíbrio (médio prazo).
    - **EMA 230:** Tendência institucional (longo prazo), agindo como grande suporte/resistência.

## 7. Simulação de Dados (Mocks)
- Crie um utilitário para gerar dados fictícios de candles OHLCV baseados em um preço inicial e volatilidade aleatória para popular o gráfico inicialmente.
- **Aviso:** Garanta que a função de cálculo de EMA processe corretamente o array de candles mockados para gerar as linhas do gráfico.

## 8. Experiência do Usuário (UX) e Design
- **Layout:** Header fixo, Sidebar à direita para indicadores e área central expansível para o gráfico.
- **Tema:** Dark Mode (fundo `#0b0e11` ou similar), velas verdes (`#00c076`) e vermelhas (`#ff3b30`) conforme padrão de exchanges.
- **Responsividade:** O gráfico deve se ajustar automaticamente ao tamanho da tela (ResponsiveContainer).

## 9. Critérios de Aceitação e Cuidados Legais
- **Disclaimer Obrigatório:** Exibir um aviso claro e não removível (ou pop-up inicial) informando que o sistema é uma ferramenta de estudo e não constitui recomendação de investimento nem garantia de lucro.
- **Sem Ordens:** O código não deve possuir funções para conexão com carteiras (wallets) ou chaves de API privadas neste estágio.
- **Foco Técnico:** O sistema deve destacar que o usuário é o único responsável por suas operações financeiras.

## 10. Próximos Passos (Para Contexto da IA)
Após a conclusão desta interface, o projeto evoluirá para:
1. Conexão real via WebSocket com a API da Binance para dados em tempo real.
2. Backend em NestJS para persistência de preferências de usuário e logs de análise.
3. Algoritmo de marcação automática de suportes e resistências baseados em picos e vales.


Esta é a especificação completa e estruturada para o back-end do seu MVP, seguindo rigorosamente os princípios de **Clean Architecture**, **Arquitetura Hexagonal** e os requisitos técnicos solicitados.

---

### 1. Setup Inicial e Dependências

**Dependências principais:**
*   `fastify`: Framework web de alta performance.
*   `zod`: Validação de esquemas e tipos.
*   `axios`: Cliente HTTP para consumir a API da Binance.
*   `typescript`: Linguagem base.
*   `jest` e `ts-jest`: Testes unitários e de integração.
*   `husky`: Hooks Git para validar commits localmente.

**Gerenciador de pacotes obrigatório:**
Use exclusivamente `pnpm`. Não use `npm` ou `yarn`.

**Scripts pnpm sugeridos:**
```json
"packageManager": "pnpm@11.0.0",
"scripts": {
  "start": "node dist/index.js",
  "dev": "tsx watch src/index.ts",
  "build": "tsc",
  "lint": "eslint .",
  "typecheck": "tsc --noEmit",
  "test": "jest",
  "prepare": "husky"
}
```

**Husky obrigatório:**
Configure `.husky/pre-commit` para executar:
```bash
pnpm lint
pnpm typecheck
pnpm test
```

---

### 2. Estrutura de Pastas (Modular Monolith)

A organização segue a separação por contextos de negócio (bounded contexts).

```text
src/
  modules/
    market/
      domain/
        entities/        # Regras de negócio puras (Candle, Analysis)
        services/        # Lógica matemática (SMA, TrendAnalyzer)
        ports/           # Interfaces (Ports) para infraestrutura
      application/
        use-cases/       # Casos de uso (GetMarketAnalysis)
        dtos/            # Data Transfer Objects
      infrastructure/
        providers/       # Adapters externos (Binance API)
      interface/
        http/
          controllers/   # Controladores Fastify
          schemas/       # Validações Zod
          routes.ts      # Definição de rotas
  shared/                # Código compartilhado entre módulos
  server.ts              # Setup do Fastify
  index.ts               # Ponto de entrada
```

---

### 3. Camada de Domínio (`src/modules/market/domain`)

#### Entidades e Tipos
```typescript
export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type Trend = 'bullish' | 'bearish' | 'neutral';

export interface MarketAnalysis {
  symbol: string;
  timeframe: string;
  candles: Candle[];
  movingAverages: {
    ma20: number[];
    ma93: number[];
    ma230: number[];
  };
  summary: {
    lastPrice: number;
    trend: Trend;
    disclaimer: string;
  };
}
```

#### Lógica de Cálculo (SMA) e TrendAnalyzer
Seguindo a fórmula aritmética: $SMA = \frac{P_1 + P_2 + \dots + P_n}{n}$.

```typescript
// src/modules/market/domain/services/IndicatorCalculator.ts
export function calculateSMA(prices: number[], period: number): number[] {
  const smas: number[] = [];
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      smas.push(0); // Dados insuficientes
      continue;
    }
    const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    smas.push(Number((sum / period).toFixed(2)));
  }
  return smas;
}

// src/modules/market/domain/services/TrendAnalyzer.ts
export class TrendAnalyzer {
  static analyze(close: number, ma20: number, ma93: number, ma230: number): Trend {
    if (close > ma20 && ma20 > ma93 && ma93 > ma230) return 'bullish';
    if (close < ma20 && ma20 < ma93 && ma93 < ma230) return 'bearish';
    return 'neutral';
  }
}
```

---

### 4. Camada de Aplicação (`src/modules/market/application`)

#### Interface do Provedor (Output Port)
```typescript
// src/modules/market/domain/ports/IMarketDataProvider.ts
export interface IMarketDataProvider {
  fetchCandles(symbol: string, interval: string, limit: number): Promise<Candle[]>;
}
```

#### Caso de Uso
```typescript
// src/modules/market/application/use-cases/GetMarketAnalysisUseCase.ts
export class GetMarketAnalysisUseCase {
  constructor(private marketDataProvider: IMarketDataProvider) {}

  async execute(symbol: string, timeframe: string, limit: number): Promise<MarketAnalysis> {
    const candles = await this.marketDataProvider.fetchCandles(symbol, timeframe, limit);
    const closePrices = candles.map(c => c.close);

    const ma20 = calculateSMA(closePrices, 20);
    const ma93 = calculateSMA(closePrices, 93);
    const ma230 = calculateSMA(closePrices, 230);

    const lastIdx = candles.length - 1;
    const trend = TrendAnalyzer.analyze(
      closePrices[lastIdx],
      ma20[lastIdx],
      ma93[lastIdx],
      ma230[lastIdx]
    );

    return {
      symbol,
      timeframe,
      candles,
      movingAverages: { ma20, ma93, ma230 },
      summary: {
        lastPrice: closePrices[lastIdx],
        trend,
        disclaimer: "Este sistema é apenas educacional e não constitui recomendação financeira."
      }
    };
  }
}
```

---

### 5. Camada de Infraestrutura (`src/modules/market/infrastructure`)

#### Provedor Binance (Outbound Adapter)
```typescript
// src/modules/market/infrastructure/providers/BinanceMarketDataProvider.ts
import axios from 'axios';

export class BinanceMarketDataProvider implements IMarketDataProvider {
  private readonly baseUrl = 'https://api.binance.com/api/v3/klines';

  async fetchCandles(symbol: string, interval: string, limit: number): Promise<Candle[]> {
    const response = await axios.get(this.baseUrl, {
      params: { symbol, interval, limit }
    });

    return response.data.map((raw: any[]) => ({
      timestamp: raw,
      open: Number(raw),
      high: Number(raw),
      low: Number(raw),
      close: Number(raw),
      volume: Number(raw),
    }));
  }
}
```

---

### 6. Camada de Interface (`src/modules/market/interface`)

#### Validação com Zod
```typescript
// src/modules/market/interface/http/schemas/MarketAnalysisSchema.ts
import { z } from 'zod';

export const MarketAnalysisQuerySchema = z.object({
  symbol: z.enum(['BTCUSDT', 'ETHUSDT', 'SOLUSDT']),
  timeframe: z.enum(['1m', '5m', '15m', '1h', '4h', '1d']),
  limit: z.coerce.number().min(230).max(1000).default(300)
});
```

---

### 7. Endpoints Fastify

```typescript
// src/modules/market/interface/http/routes.ts
export async function marketRoutes(fastify: FastifyInstance) {
  const provider = new BinanceMarketDataProvider();
  const useCase = new GetMarketAnalysisUseCase(provider);

  fastify.get('/health', async () => ({ status: 'ok' }));

  fastify.get('/assets', async () => (['BTCUSDT', 'ETHUSDT', 'SOLUSDT']));

  fastify.get('/timeframes', async () => (['1m', '5m', '15m', '1h', '4h', '1d']));

  fastify.get('/market-analysis', async (request, reply) => {
    const validation = MarketAnalysisQuerySchema.safeParse(request.query);
    if (!validation.success) return reply.status(400).send(validation.error);

    const { symbol, timeframe, limit } = validation.data;
    const result = await useCase.execute(symbol, timeframe, limit);
    return result;
  });
}
```

---

### 8. Testes Sugeridos (Jest)

1.  **Unitário (SMA):** Validar se o cálculo ignora os primeiros 19 elementos e calcula corretamente a partir do 20º.
2.  **Unitário (TrendAnalyzer):** Simular quatro cenários: Bullish (preço > 20 > 93 > 230), Bearish (preço < 20 < 93 < 230) e Neutral.
3.  **Integração:** Mockar o `IMarketDataProvider` para garantir que o use case orquestra os dados sem depender da Binance real.

---

### 9. Preparação para o Futuro

*   **WebSocket:** O módulo `market/infrastructure` poderá adicionar um `BinanceWebSocketProvider` para streams em tempo real.
*   **Redis:** Cachear o resultado de `fetchCandles` para evitar rate limit da Binance.
*   **IA:** A camada de domínio poderá receber um `TrendPredictor` que usa modelos pré-treinados.
*   **PostgreSQL:** Utilizar Prisma no `infrastructure/repositories` para salvar logs de acessos ou alertas configurados pelo usuário.

Este código fornece uma base sólida, isolando a volatilidade das APIs externas e frameworks da lógica de negócio pura do trade.



# ChartFlow AI - Engineering Skills & Rules

## Project Vision
ChartFlow AI is an educational trading analysis platform focused on:
- technical analysis
- market visualization
- AI-assisted insights
- scalable architecture

The system DOES NOT:
- execute trades
- provide financial advice
- guarantee profits

---

# Tech Stack

## Frontend
- React / Next.js
- TypeScript
- TailwindCSS
- TradingView Lightweight Charts

## Backend
- Node.js
- Fastify
- TypeScript
- Zod

## Tooling
- Use pnpm as the only package manager
- Use Husky for Git hooks
- Keep `packageManager` pinned in `package.json`
- Run `pnpm install` after dependency changes
- Run `pnpm lint`, `pnpm typecheck`, and `pnpm test` before commits

---

# Architecture Rules

## Principles
- SOLID
- Clean Architecture
- Hexagonal Architecture
- DDD concepts
- Monolithic modular structure

## Important Rules
- Domain layer cannot depend on frameworks
- Infrastructure must be isolated
- External APIs must use adapters/providers
- Business rules stay in domain/application
- Controllers must stay thin
- Use cases orchestrate business flow

---

# Folder Structure

src/
  modules/
    market/
      domain/
      application/
      infrastructure/
      interface/

---

# Coding Standards

## TypeScript
- Avoid `any`
- Prefer readonly when possible
- Use explicit types
- Prefer composition over inheritance

## Naming
- Use PascalCase for classes
- camelCase for functions
- kebab-case for folders

---

# Trading Rules

## Indicators
Initial indicators:
- SMA 20
- SMA 93
- SMA 230

Future indicators:
- RSI
- MACD
- Volume Profile

## Trend Logic
bullish:
close > ma20 > ma93 > ma230

bearish:
close < ma20 < ma93 < ma230

neutral:
all other cases

---

# API Standards

## Error Format
```json
{
  "error": {
    "code": "INVALID_TIMEFRAME",
    "message": "Invalid timeframe"
  }
}
```

---

# Security

- Never expose API keys
- Use .env files
- Validate all inputs
- Never trust frontend data

---

# AI Rules

AI should:
- explain market structure
- generate educational insights
- summarize indicators

AI should NOT:
- tell users to buy/sell
- promise profits
- act as financial advisor

---

# Git Standards

Commits:
feat:
fix:
refactor:
docs:
test:
chore:

Example:
feat(market): add SMA 20 calculation

Hooks:
- Husky pre-commit must run `pnpm lint`
- Husky pre-commit must run `pnpm typecheck`
- Husky pre-commit must run `pnpm test`

---

# Future Roadmap

V1:
- chart
- candles
- moving averages

V2:
- AI explanations
- RSI
- MACD

V3:
- websocket realtime
- alerts
- authentication

V4:
- advanced AI
- multi-timeframe analysis
- backtesting

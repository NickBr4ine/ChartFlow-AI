import { BadGatewayException, BadRequestException, Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { MarketService } from "./market.service";
import { MarketAnalysisQuerySchema } from "./interface/http/schemas/MarketAnalysisSchema";

const ASSETS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT"] as const;
const TIMEFRAMES = ["1m", "5m", "15m", "1h", "4h", "1d"] as const;

@Controller()
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Get("health")
  health() {
    return { status: "ok" };
  }

  @Get("assets")
  assets() {
    return ASSETS;
  }

  @Get("timeframes")
  timeframes() {
    return TIMEFRAMES;
  }

  @Get("market-analysis")
  @UseGuards(AuthGuard)
  async marketAnalysis(@Query() query: Record<string, unknown>) {
    const validation = MarketAnalysisQuerySchema.safeParse(query);

    if (!validation.success) {
      throw new BadRequestException({
        error: {
          code: "INVALID_MARKET_ANALYSIS_QUERY",
          message: validation.error.issues[0]?.message ?? "Invalid request query"
        }
      });
    }

    try {
      const { symbol, timeframe, limit, maPeriods } = validation.data;
      return await this.marketService.getAnalysis(symbol, timeframe, limit, maPeriods);
    } catch {
      throw new BadGatewayException({
        error: {
          code: "MARKET_DATA_PROVIDER_ERROR",
          message: "Unable to fetch market data"
        }
      });
    }
  }
}

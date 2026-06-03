import { Module } from "@nestjs/common";
import { AuthModule } from "./modules/auth/auth.module";
import { MarketModule } from "./modules/market/market.module";

@Module({
  imports: [AuthModule, MarketModule]
})
export class AppModule {}

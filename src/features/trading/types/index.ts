import type { Time } from "lightweight-charts";

export type Timeframe = "1m" | "5m" | "15m" | "1h" | "1d";

export type MovingAveragePeriod = 20 | 93 | 230;

export type PriceRelation = "above" | "below" | "equal";

export type RiskLevel = "low" | "medium" | "high";

export interface Candle {
  readonly time: Time;
  readonly open: number;
  readonly high: number;
  readonly low: number;
  readonly close: number;
  readonly volume: number;
}

export interface CryptoAsset {
  readonly symbol: string;
  readonly name: string;
  readonly icon: string;
  readonly initialPrice: number;
  readonly volatility: number;
}

export interface MovingAverage {
  readonly period: MovingAveragePeriod;
  readonly color: string;
  readonly value: number;
}

export interface IndicatorSummary {
  readonly period: MovingAveragePeriod;
  readonly label: string;
  readonly average: number;
  readonly relation: PriceRelation;
  readonly description: string;
}

export interface EmaPoint {
  readonly time: Time;
  readonly value: number;
}

export interface EmaLines {
  readonly ema20: EmaPoint[];
  readonly ema93: EmaPoint[];
  readonly ema230: EmaPoint[];
}

export interface SmaLines {
  readonly sma20: EmaPoint[];
  readonly sma93: EmaPoint[];
  readonly sma230: EmaPoint[];
}

export interface AIInsight {
  readonly text: string;
  readonly riskLevel: RiskLevel;
  readonly disclaimer: string;
}

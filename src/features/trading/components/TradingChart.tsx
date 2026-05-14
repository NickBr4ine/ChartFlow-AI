"use client";

import {
  CandlestickSeries,
  CrosshairMode,
  LineSeries,
  createChart,
  type CandlestickData,
  type ISeriesApi,
  type LineData,
  type Time
} from "lightweight-charts";
import { useEffect, useRef, useState } from "react";
import type { Candle, SmaLines } from "../types";

interface TradingChartProps {
  readonly candles: readonly Candle[];
  readonly smaLines: SmaLines;
}

interface TooltipState {
  readonly left: number;
  readonly top: number;
  readonly close: number;
  readonly sma20?: number;
  readonly sma93?: number;
  readonly sma230?: number;
}

function getLineValue(series: ISeriesApi<"Line", Time>, data: ReadonlyMap<unknown, unknown>): number | undefined {
  const point = data.get(series) as LineData<Time> | undefined;
  return point?.value;
}

export function TradingChart({ candles, smaLines }: TradingChartProps) {
  const chartElementRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  useEffect(() => {
    const element = chartElementRef.current;
    if (!element) {
      return undefined;
    }

    const chart = createChart(element, {
      width: element.clientWidth,
      height: 560,
      layout: {
        background: { color: "#0b0e11" },
        textColor: "#8a96a8"
      },
      grid: {
        vertLines: { color: "#18202a" },
        horzLines: { color: "#18202a" }
      },
      crosshair: {
        mode: CrosshairMode.Normal
      },
      rightPriceScale: {
        borderColor: "#27313d"
      },
      timeScale: {
        borderColor: "#27313d",
        timeVisible: true
      }
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#00c076",
      downColor: "#ff3b30",
      borderUpColor: "#00c076",
      borderDownColor: "#ff3b30",
      wickUpColor: "#00c076",
      wickDownColor: "#ff3b30"
    });
    const sma20Series = chart.addSeries(LineSeries, { color: "#3fd7ff", lineWidth: 2 });
    const sma93Series = chart.addSeries(LineSeries, { color: "#f5b544", lineWidth: 2 });
    const sma230Series = chart.addSeries(LineSeries, { color: "#c79cff", lineWidth: 2 });

    candleSeries.setData(candles.map(({ time, open, high, low, close }) => ({ time, open, high, low, close })));
    sma20Series.setData(smaLines.sma20);
    sma93Series.setData(smaLines.sma93);
    sma230Series.setData(smaLines.sma230);
    chart.timeScale().fitContent();

    const resizeObserver = new ResizeObserver(([entry]) => {
      chart.applyOptions({ width: entry.contentRect.width });
    });

    resizeObserver.observe(element);

    chart.subscribeCrosshairMove((param) => {
      if (!param.point || !param.time) {
        setTooltip(null);
        return;
      }

      const candle = param.seriesData.get(candleSeries) as CandlestickData<Time> | undefined;
      if (!candle) {
        setTooltip(null);
        return;
      }

      setTooltip({
        left: Math.min(param.point.x + 16, Math.max(element.clientWidth - 220, 0)),
        top: Math.max(param.point.y - 72, 12),
        close: candle.close,
        sma20: getLineValue(sma20Series, param.seriesData as ReadonlyMap<unknown, unknown>),
        sma93: getLineValue(sma93Series, param.seriesData as ReadonlyMap<unknown, unknown>),
        sma230: getLineValue(sma230Series, param.seriesData as ReadonlyMap<unknown, unknown>)
      });
    });

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [candles, smaLines]);

  return (
    <div className="relative min-h-96 w-full overflow-hidden">
      <div ref={chartElementRef} className="h-[560px] w-full" />
      {tooltip ? (
        <div
          className="pointer-events-none absolute z-10 w-52 rounded-md border border-chart-border bg-[#0f141b]/95 p-3 text-xs shadow-xl"
          style={{ left: tooltip.left, top: tooltip.top }}
        >
          <p className="font-semibold text-white">Close {tooltip.close.toFixed(2)}</p>
          <p className="mt-2 text-chart-cyan">SMA 20 {tooltip.sma20?.toFixed(2) ?? "-"}</p>
          <p className="text-chart-amber">SMA 93 {tooltip.sma93?.toFixed(2) ?? "-"}</p>
          <p className="text-[#c79cff]">SMA 230 {tooltip.sma230?.toFixed(2) ?? "-"}</p>
        </div>
      ) : null}
    </div>
  );
}

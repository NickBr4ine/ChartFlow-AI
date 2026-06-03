"use client";

import {
  CandlestickSeries,
  CrosshairMode,
  LineStyle,
  LineSeries,
  createChart,
  type CandlestickData,
  type ISeriesApi,
  type LineData,
  type Time
} from "lightweight-charts";
import { useEffect, useRef, useState } from "react";
import type { Candle, PriceLine, SmaLines } from "../types";

interface TradingChartProps {
  readonly candles: readonly Candle[];
  readonly smaLines: SmaLines;
  readonly priceLines?: readonly PriceLine[];
}

interface TooltipState {
  readonly left: number;
  readonly top: number;
  readonly close: number;
  readonly lines: readonly {
    readonly label: string;
    readonly color: string;
    readonly value?: number;
  }[];
}

function getLineValue(series: ISeriesApi<"Line", Time>, data: ReadonlyMap<unknown, unknown>): number | undefined {
  const point = data.get(series) as LineData<Time> | undefined;
  return point?.value;
}

export function TradingChart({ candles, smaLines, priceLines = [] }: TradingChartProps) {
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
    const movingAverageSeries = smaLines.map((line) => chart.addSeries(LineSeries, { color: line.color, lineWidth: 2 }));

    candleSeries.setData(candles.map(({ time, open, high, low, close }) => ({ time, open, high, low, close })));
    movingAverageSeries.forEach((series, index) => {
      series.setData([...(smaLines[index]?.points ?? [])]);
    });
    priceLines.forEach((line) => {
      candleSeries.createPriceLine({
        price: line.value,
        color: line.color,
        lineWidth: 2,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: line.label
      });
    });
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
        lines: movingAverageSeries.map((series, index) => ({
          label: `SMA ${smaLines[index]?.period ?? ""}`.trim(),
          color: smaLines[index]?.color ?? "#8a96a8",
          value: getLineValue(series, param.seriesData as ReadonlyMap<unknown, unknown>)
        }))
      });
    });

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [candles, smaLines, priceLines]);

  return (
    <div className="relative min-h-96 w-full overflow-hidden">
      <div ref={chartElementRef} className="h-[560px] w-full" />
      {tooltip ? (
        <div
          className="pointer-events-none absolute z-10 w-52 rounded-md border border-chart-border bg-[#0f141b]/95 p-3 text-xs shadow-xl"
          style={{ left: tooltip.left, top: tooltip.top }}
        >
          <p className="font-semibold text-white">Close {tooltip.close.toFixed(2)}</p>
          <div className="mt-2 space-y-1">
            {tooltip.lines.map((line) => (
              <p key={line.label} style={{ color: line.color }}>
                {line.label} {line.value?.toFixed(2) ?? "-"}
              </p>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

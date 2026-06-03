export function normalizeMovingAveragePeriods(periods: readonly number[] | undefined): number[] {
  return [...new Set(periods?.filter((period) => Number.isInteger(period) && period >= 2 && period <= 500) ?? [])].sort(
    (left, right) => left - right
  );
}

export function getMovingAverageColor(period: number): string {
  const fixedColors: Record<number, string> = {
    20: "#3fd7ff",
    93: "#f5b544",
    230: "#c79cff"
  };
  const palette = ["#3fd7ff", "#f5b544", "#c79cff", "#00c076", "#ff6b8a", "#7dd3fc"];

  return fixedColors[period] ?? palette[Math.abs(period) % palette.length];
}

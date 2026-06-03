export function calculateSMA(prices: readonly number[], period: number): number[] {
  if (period <= 0) {
    throw new Error("SMA period must be greater than zero");
  }

  const smas: number[] = [];

  for (let index = 0; index < prices.length; index += 1) {
    if (index < period - 1) {
      smas.push(0);
      continue;
    }

    const window = prices.slice(index - period + 1, index + 1);
    const sum = window.reduce((total, price) => total + price, 0);
    smas.push(Number((sum / period).toFixed(2)));
  }

  return smas;
}

/**
 * Formatting for the crypto page only. Unlike the ledger, market figures arrive as `number` (USD
 * reference prices, not the user's money-of-record), so they are formatted here rather than through
 * `lib/format`, which speaks in two-decimal money strings. Nothing here does arithmetic — every
 * value is already final from the upstream; these functions only render it (R-B3 stays intact).
 *
 * Everything is quoted in USD because the server always asks CoinGecko for USD; showing it in the
 * user's own currency would imply a conversion the app never performed.
 */

const MARKET_CURRENCY = 'USD';

const priceFormatter = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: MARKET_CURRENCY,
});

/** Sub-dollar coins need more places, or a $0.00003 token would render as "$0.00". */
const smallPriceFormatter = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: MARKET_CURRENCY,
  maximumFractionDigits: 6,
});

/** A USD spot price, with extra precision for anything trading below a dollar. Em dash when absent. */
export function formatCoinPrice(price: number | null): string {
  if (price === null) {
    return '—';
  }

  const formatter = price !== 0 && Math.abs(price) < 1 ? smallPriceFormatter : priceFormatter;

  return formatter.format(price);
}

const marketCapFormatter = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: MARKET_CURRENCY,
  notation: 'compact',
  maximumFractionDigits: 2,
});

/** Compact USD market cap ("$1.28T"); the exact figure is not the point at a glance. */
export function formatMarketCap(marketCap: number | null): string {
  if (marketCap === null) {
    return '—';
  }

  return marketCapFormatter.format(marketCap);
}

const changeFormatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: 'always',
});

/**
 * A 24h change with an explicit leading sign, so direction is carried by the text and not by colour
 * alone (the card also colours it, but the sign is what a screen reader and a mono-vision reader
 * get). Em dash when the upstream omitted the figure.
 */
export function formatChange(change: number | null): string {
  if (change === null) {
    return '—';
  }

  return `${changeFormatter.format(change)}%`;
}

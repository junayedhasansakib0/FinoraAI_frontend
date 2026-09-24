/**
 * Formatting for the currency converter only. Like the crypto page, the figures here arrive as
 * `number` (ECB reference rates and converted amounts, not the user's money-of-record), so they are
 * formatted here rather than through `lib/format`, which speaks in two-decimal money strings.
 * Nothing here does arithmetic — the server has already done the conversion (R-B3); these only
 * render what it returned.
 */

/**
 * A converted amount in its target currency. `Intl` supplies the symbol and grouping for any valid
 * ISO code; an unknown code (should not happen — the server validated it) falls back to the code
 * plus the plain number rather than throwing.
 */
export function formatConverted(amount: number, currencyCode: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString()} ${currencyCode}`;
  }
}

const rateFormatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 6,
});

/** The exchange rate itself, with enough places for a sub-unit rate without trailing noise. */
export function formatRate(rate: number): string {
  return rateFormatter.format(rate);
}

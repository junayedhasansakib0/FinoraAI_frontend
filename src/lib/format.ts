/**
 * Money and dates are only ever formatted here, never recomputed: the API sends amounts as
 * decimal strings and all arithmetic stays on the server (R-B3, R-D2).
 */

/** Stands in when a currency is unknown, or before the signed-in profile has been read. */
export const FALLBACK_CURRENCY = 'USD';

const moneyFormatters = new Map<string, Intl.NumberFormat>();

function moneyFormatter(currency: string): Intl.NumberFormat {
  const cached = moneyFormatters.get(currency);

  if (cached !== undefined) {
    return cached;
  }

  let created: Intl.NumberFormat;

  try {
    created = new Intl.NumberFormat(undefined, { style: 'currency', currency });
  } catch {
    // An unknown currency code would otherwise throw on every row it appears in.
    created = new Intl.NumberFormat(undefined, { style: 'currency', currency: FALLBACK_CURRENCY });
  }

  moneyFormatters.set(currency, created);

  return created;
}

/**
 * The decimal string is handed to `Intl` as-is, so no float rounding ever touches the value
 * (R-F6). `currency` comes from the signed-in user's profile.
 */
export function formatMoney(amount: string, currency: string): string {
  return moneyFormatter(currency).format(amount as Intl.StringNumericLiteral);
}

/**
 * Transaction dates are stored against UTC, so they are read back in UTC: formatting in the
 * browser's zone would show the day before for anyone west of Greenwich.
 */
const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeZone: 'UTC' });

export function formatTransactionDate(isoDate: string): string {
  const parsed = new Date(isoDate);

  if (Number.isNaN(parsed.getTime())) {
    return '—';
  }

  return dateFormatter.format(parsed);
}

/** The `YYYY-MM-DD` a `<input type="date">` expects, on the same UTC calendar day. */
export function toDateInputValue(isoDate: string): string {
  return isoDate.slice(0, 10);
}

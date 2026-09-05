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

/**
 * True when a money string is below zero. It reads the sign character rather than parsing the
 * value, so a balance stays a decimal string all the way to the screen (R-B3).
 */
export function isNegativeMoney(amount: string): boolean {
  return amount.startsWith('-');
}

const percentFormatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 });

/**
 * Percentages arrive from the API already worked out to one decimal (R-B3), so this only writes
 * them: the number is formatted for the locale and the sign appended, never divided or scaled.
 */
export function formatPercent(value: number): string {
  return `${percentFormatter.format(value)}%`;
}

/**
 * A month the API named by number, on the calendar it named it in. Both formatters read a UTC
 * instant built from that month, so the label can never slip to the neighbouring month the way a
 * locally interpreted date would.
 */
const monthFormatters = {
  long: new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric', timeZone: 'UTC' }),
  short: new Intl.DateTimeFormat(undefined, { month: 'short', timeZone: 'UTC' }),
};

function monthInstant(month: number, year: number): Date {
  return new Date(Date.UTC(year, month - 1, 1));
}

/** "September 2026" — for headings and table rows, where there is room to be unambiguous. */
export function formatMonthLong(month: number, year: number): string {
  return monthFormatters.long.format(monthInstant(month, year));
}

/** "Sep" — for chart axes at 360px, where the full label would collide with its neighbour. */
export function formatMonthShort(month: number, year: number): string {
  return monthFormatters.short.format(monthInstant(month, year));
}

const axisFormatter = new Intl.NumberFormat(undefined, {
  notation: 'compact',
  maximumFractionDigits: 1,
});

/**
 * A chart axis tick. Its input is the plotted coordinate, not a money value, and it carries no
 * currency symbol — six of those on one axis is noise. The tooltip and the table under every chart
 * are where the exact amounts are read.
 */
export function formatAxisAmount(value: number): string {
  return axisFormatter.format(value);
}

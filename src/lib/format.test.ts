import { describe, expect, it } from 'vitest';

import {
  FALLBACK_CURRENCY,
  formatAxisAmount,
  formatMoney,
  formatMonthLong,
  formatMonthShort,
  formatPercent,
  formatTransactionDate,
  isNegativeMoney,
  toDateInputValue,
} from './format';

/**
 * The money/date formatters (R-T5). They only ever format — no arithmetic — so the assertions
 * pin the wiring: the right `Intl` options, UTC anchoring, the invalid-input fallbacks, and the
 * sign read. Locale-dependent output is checked against a reference `Intl` built the same way, so
 * the suite is deterministic in any locale (R-T6) rather than hard-coding en-US strings.
 */

function moneyRef(amount: string, currency: string): string {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(
    amount as Intl.StringNumericLiteral,
  );
}

describe('formatMoney', () => {
  it('formats a decimal string as currency without touching the value', () => {
    expect(formatMoney('1234.50', 'USD')).toBe(moneyRef('1234.50', 'USD'));
    expect(formatMoney('0.00', 'EUR')).toBe(moneyRef('0.00', 'EUR'));
  });

  it('falls back to USD for a malformed currency code instead of throwing', () => {
    // A well-formed but unknown 3-letter code (e.g. "ZZZ") is accepted by Intl and rendered with
    // the code as its own symbol; only a malformed code makes the constructor throw and take the
    // fallback path.
    expect(formatMoney('4.50', 'X')).toBe(moneyRef('4.50', FALLBACK_CURRENCY));
  });
});

describe('formatTransactionDate', () => {
  it('formats an ISO instant on the UTC calendar day', () => {
    const iso = '2026-08-01T09:15:00.000Z';
    const ref = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeZone: 'UTC' }).format(
      new Date(iso),
    );

    expect(formatTransactionDate(iso)).toBe(ref);
  });

  it('returns an em dash for an unparseable date', () => {
    expect(formatTransactionDate('not-a-date')).toBe('—');
  });
});

describe('toDateInputValue', () => {
  it('keeps the YYYY-MM-DD prefix of the UTC instant', () => {
    expect(toDateInputValue('2026-08-01T23:59:00.000Z')).toBe('2026-08-01');
  });
});

describe('isNegativeMoney', () => {
  it('reads the sign character rather than parsing', () => {
    expect(isNegativeMoney('-0.01')).toBe(true);
    expect(isNegativeMoney('0.00')).toBe(false);
    expect(isNegativeMoney('1200.00')).toBe(false);
  });
});

describe('formatPercent', () => {
  it('appends a percent sign to the locale-formatted number', () => {
    const ref = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(42.5);

    expect(formatPercent(42.5)).toBe(`${ref}%`);
  });
});

describe('month labels', () => {
  it('names the month on the calendar it was given, never slipping a month', () => {
    const instant = new Date(Date.UTC(2026, 0, 1));
    const long = new Intl.DateTimeFormat(undefined, {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(instant);
    const short = new Intl.DateTimeFormat(undefined, { month: 'short', timeZone: 'UTC' }).format(
      instant,
    );

    expect(formatMonthLong(1, 2026)).toBe(long);
    expect(formatMonthShort(1, 2026)).toBe(short);
  });
});

describe('formatAxisAmount', () => {
  it('renders a compact number with no currency symbol', () => {
    const ref = new Intl.NumberFormat(undefined, {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(12000);

    expect(formatAxisAmount(12000)).toBe(ref);
  });
});

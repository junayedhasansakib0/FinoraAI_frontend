import { describe, expect, it } from 'vitest';

import { formatChange, formatCoinPrice, formatMarketCap } from './format';

/**
 * Crypto market formatters (R-T5). Market figures arrive as `number` and are only rendered here.
 * Locale output is compared against a matching reference `Intl` so the suite holds in any locale
 * (R-T6); the branch choices (sub-dollar precision, null → em dash, explicit sign) are asserted
 * directly.
 */

const USD = { style: 'currency', currency: 'USD' } as const;

describe('formatCoinPrice', () => {
  it('returns an em dash when the price is absent', () => {
    expect(formatCoinPrice(null)).toBe('—');
  });

  it('uses two-decimal currency for a dollar-and-up price', () => {
    expect(formatCoinPrice(1234.5)).toBe(new Intl.NumberFormat(undefined, USD).format(1234.5));
  });

  it('uses extra precision for a sub-dollar price so it does not collapse to $0.00', () => {
    const small = new Intl.NumberFormat(undefined, { ...USD, maximumFractionDigits: 6 }).format(
      0.00003,
    );

    expect(formatCoinPrice(0.00003)).toBe(small);
    // The default two-decimal formatter would have rounded this away.
    expect(formatCoinPrice(0.00003)).not.toBe(new Intl.NumberFormat(undefined, USD).format(0.00003));
  });

  it('treats exactly zero as a normal (not sub-dollar) price', () => {
    expect(formatCoinPrice(0)).toBe(new Intl.NumberFormat(undefined, USD).format(0));
  });
});

describe('formatMarketCap', () => {
  it('renders a compact currency figure, em dash when absent', () => {
    const ref = new Intl.NumberFormat(undefined, {
      ...USD,
      notation: 'compact',
      maximumFractionDigits: 2,
    }).format(1_280_000_000_000);

    expect(formatMarketCap(1_280_000_000_000)).toBe(ref);
    expect(formatMarketCap(null)).toBe('—');
  });
});

describe('formatChange', () => {
  it('carries an explicit leading sign and a percent suffix', () => {
    const ref = (value: number) =>
      new Intl.NumberFormat(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        signDisplay: 'always',
      }).format(value);

    expect(formatChange(2.5)).toBe(`${ref(2.5)}%`);
    expect(formatChange(-3)).toBe(`${ref(-3)}%`);
    expect(formatChange(null)).toBe('—');
  });
});

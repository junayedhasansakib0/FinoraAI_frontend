import { describe, expect, it } from 'vitest';

import { formatConverted, formatRate } from './format';

/**
 * Currency-converter formatters (R-T5). The conversion happens on the server (R-B3); these only
 * render the returned numbers. Compared against a matching reference `Intl` for locale
 * independence (R-T6), with the invalid-code fallback asserted directly.
 */

describe('formatConverted', () => {
  it('formats the amount in its target currency', () => {
    const ref = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR' }).format(
      1234.5,
    );

    expect(formatConverted(1234.5, 'EUR')).toBe(ref);
  });

  it('falls back to the plain number plus the code for a malformed currency', () => {
    // Only a malformed code (not merely an unknown one) makes Intl throw into the fallback.
    expect(formatConverted(1234.5, 'X')).toBe(`${(1234.5).toLocaleString()} X`);
  });
});

describe('formatRate', () => {
  it('shows enough places for a sub-unit rate without trailing noise', () => {
    const ref = new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(0.925);

    expect(formatRate(0.925)).toBe(ref);
  });
});

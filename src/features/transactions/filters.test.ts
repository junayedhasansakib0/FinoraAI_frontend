import { describe, expect, it } from 'vitest';

import { DEFAULT_FILTERS, hasActiveFilters } from './filters';

/**
 * `hasActiveFilters` (R-T5) is the single source for "is anything filtered?", read by both the
 * empty state and the clear-all button. Sort/order/page/limit only reorder, so they must not count
 * as narrowing.
 */

describe('hasActiveFilters', () => {
  it('is false for the defaults (sort/order/page only)', () => {
    expect(hasActiveFilters(DEFAULT_FILTERS)).toBe(false);
  });

  it('stays false when only paging or ordering changes', () => {
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, page: 3, limit: 50, order: 'asc' })).toBe(false);
  });

  it('is true once any narrowing key is set', () => {
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, search: 'coffee' })).toBe(true);
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, type: 'expense' })).toBe(true);
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, minAmount: '5' })).toBe(true);
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, from: '2026-08-01' })).toBe(true);
  });
});

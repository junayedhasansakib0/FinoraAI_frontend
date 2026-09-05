import type { TransactionFilters } from '@/api/transactions';

/**
 * Shared by the filter bar and the page that owns the values, so "is anything filtered?" is
 * answered in one place — the empty state and the clear-all button both depend on it.
 */

/** Sort and order always carry a value; the rest are absent until someone sets them. */
export const DEFAULT_FILTERS: TransactionFilters = { sort: 'date', order: 'desc', page: 1 };

/** The keys that narrow the ledger. `sort`, `order`, `page`, and `limit` only reorder it. */
const NARROWING_KEYS = [
  'search',
  'type',
  'categoryId',
  'from',
  'to',
  'minAmount',
  'maxAmount',
] as const;

export function hasActiveFilters(filters: TransactionFilters): boolean {
  return NARROWING_KEYS.some((key) => filters[key] !== undefined);
}

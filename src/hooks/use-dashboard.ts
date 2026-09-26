import { useQuery } from '@tanstack/react-query';

import { fetchDashboardAnalytics, fetchDashboardSummary } from '@/api/dashboard';
import { ANALYTICS_MONTHS } from '@/lib/constants';

/**
 * Server state for `/dashboard` (ARCHITECTURE.md §3). One entry per endpoint under `['dashboard']`,
 * so a write anywhere in the app can retire every dashboard figure at once by that prefix.
 */

export const dashboardKeys = {
  all: ['dashboard'] as const,
  summary: () => ['dashboard', 'summary'] as const,
  /** The month count is part of the key: six months and twelve are different answers. */
  analytics: (months: number) => ['dashboard', 'analytics', months] as const,
};

export function useDashboardSummary() {
  return useQuery({
    queryKey: dashboardKeys.summary(),
    queryFn: ({ signal }) => fetchDashboardSummary(signal),
  });
}

/**
 * `enabled` gates the request: the verified-email gate (§7) refuses analytics to an unconfirmed
 * account, so a page that already knows the account is unverified passes `enabled: false` and the
 * predictably-refused call is never made. A disabled query stays `pending`, so callers must read
 * `enabled` too before treating `isPending` as "still loading".
 */
export function useDashboardAnalytics(
  months: number = ANALYTICS_MONTHS,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: dashboardKeys.analytics(months),
    queryFn: ({ signal }) => fetchDashboardAnalytics(months, signal),
    enabled: options.enabled ?? true,
  });
}

import { apiClient } from './client';

import type { ApiSuccess, DashboardAnalytics, DashboardSummary } from '@/types/api';

/**
 * `/dashboard` calls (ARCHITECTURE.md §7). Both endpoints are read-only, and every figure in the
 * responses is already computed: nothing here derives a number of its own (R-B3).
 */

export async function fetchDashboardSummary(signal?: AbortSignal) {
  const response = await apiClient.get<ApiSuccess<DashboardSummary>>('/dashboard/summary', {
    signal,
  });

  return response.data.data;
}

export async function fetchDashboardAnalytics(months: number, signal?: AbortSignal) {
  const response = await apiClient.get<ApiSuccess<DashboardAnalytics>>('/dashboard/analytics', {
    params: { months },
    signal,
  });

  return response.data.data;
}

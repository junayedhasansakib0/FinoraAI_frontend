import { apiClient } from './client';

import type { AiReport, AiReportsPayload, ApiSuccess } from '@/types/api';

/**
 * `/ai` calls (ARCHITECTURE.md §7). Four POSTs each turn the user's ledger into one report and one
 * GET reads the recent history. `?refresh=true` on a POST bypasses the server's 24h reuse (R-I6);
 * quota, aggregation, and output validation all live on the server (R-I1/R-I4) — the client only
 * asks and renders the plain-text result (R-I5). A POST returns the report directly as `data`; the
 * history GET wraps it as `{ reports }`.
 */

/** The month a monthly summary covers; the only report input beyond the report kind itself. */
export interface MonthlySummaryInput {
  /** 1–12. */
  month: number;
  year: number;
}

/** Optional filters for the history read: one kind and a page size (server-bounded). */
export interface ReportsQuery {
  type?: AiReport['type'];
  limit?: number;
}

/** Only the literal string `true` forces a refresh; an absent flag reads as reuse (R-I6). */
function refreshParams(refresh: boolean | undefined): Record<string, string> {
  return refresh === true ? { refresh: 'true' } : {};
}

export async function generateSpendingAnalysis(refresh?: boolean): Promise<AiReport> {
  const response = await apiClient.post<ApiSuccess<AiReport>>('/ai/spending-analysis', undefined, {
    params: refreshParams(refresh),
  });

  return response.data.data;
}

export async function generateMonthlySummary(
  input: MonthlySummaryInput,
  refresh?: boolean,
): Promise<AiReport> {
  const response = await apiClient.post<ApiSuccess<AiReport>>('/ai/monthly-summary', input, {
    params: refreshParams(refresh),
  });

  return response.data.data;
}

export async function generateSavingsRecommendations(refresh?: boolean): Promise<AiReport> {
  const response = await apiClient.post<ApiSuccess<AiReport>>(
    '/ai/savings-recommendations',
    undefined,
    { params: refreshParams(refresh) },
  );

  return response.data.data;
}

export async function generateBudgetRecommendations(refresh?: boolean): Promise<AiReport> {
  const response = await apiClient.post<ApiSuccess<AiReport>>(
    '/ai/budget-recommendations',
    undefined,
    { params: refreshParams(refresh) },
  );

  return response.data.data;
}

/** The user's recent reports, newest first, optionally filtered to one kind. */
export async function listReports(
  query: ReportsQuery = {},
  signal?: AbortSignal,
): Promise<AiReport[]> {
  const response = await apiClient.get<ApiSuccess<AiReportsPayload>>('/ai/reports', {
    params: {
      ...(query.type ? { type: query.type } : {}),
      ...(query.limit ? { limit: String(query.limit) } : {}),
    },
    signal,
  });

  return response.data.data.reports;
}

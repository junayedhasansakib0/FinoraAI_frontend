import { apiClient } from './client';

import type {
  ApiSuccess,
  TransactionPage,
  TransactionPayload,
  TransactionType,
} from '@/types/api';

/** `/transactions` calls (ARCHITECTURE.md §7). */

export type TransactionSort = 'date' | 'amount';
export type SortOrder = 'asc' | 'desc';

/** Every filter the list endpoint accepts; all optional, all combinable. */
export interface TransactionFilters {
  search?: string;
  type?: TransactionType;
  categoryId?: string;
  from?: string;
  to?: string;
  minAmount?: string;
  maxAmount?: string;
  sort?: TransactionSort;
  order?: SortOrder;
  page?: number;
  limit?: number;
}

export interface TransactionInput {
  type: TransactionType;
  /** A decimal string, so the value the person typed reaches the API unrounded (R-B3). */
  amount: string;
  categoryId: string;
  description?: string;
  date: string;
}

/** A cleared field is left out of the query string rather than sent as an empty value. */
function toParams(filters: TransactionFilters): Record<string, string> {
  const params: Record<string, string> = {};

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== '') {
      params[key] = String(value);
    }
  }

  return params;
}

export async function fetchTransactions(filters: TransactionFilters, signal?: AbortSignal) {
  const response = await apiClient.get<ApiSuccess<TransactionPage>>('/transactions', {
    params: toParams(filters),
    signal,
  });

  return response.data.data;
}

export async function createTransaction(input: TransactionInput) {
  const response = await apiClient.post<ApiSuccess<TransactionPayload>>('/transactions', input);

  return response.data.data.transaction;
}

export async function updateTransaction(id: string, input: Partial<TransactionInput>) {
  const response = await apiClient.patch<ApiSuccess<TransactionPayload>>(
    `/transactions/${encodeURIComponent(id)}`,
    input,
  );

  return response.data.data.transaction;
}

export async function deleteTransaction(id: string): Promise<void> {
  await apiClient.delete(`/transactions/${encodeURIComponent(id)}`);
}

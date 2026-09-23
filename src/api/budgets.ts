import { apiClient } from './client';

import type {
  ApiSuccess,
  Budget,
  BudgetPayload,
  BudgetsPayload,
} from '@/types/api';

/** `/budgets` calls (ARCHITECTURE.md §7). */

/** Query parameters for listing budgets. */
export interface BudgetsFilters {
  month?: number;
  year?: number;
}

/** Input for creating a new budget. */
export interface BudgetInput {
  amount: string;
  month: number;
  year: number;
  categoryId: string | null;
}

/** Input for updating a budget's amount. */
export interface BudgetUpdateInput {
  amount: string;
}

/** List budgets for the authenticated user. */
export async function listBudgets(
  filters: BudgetsFilters = {},
  signal?: AbortSignal,
): Promise<Budget[]> {
  const { month, year } = filters;
  const response = await apiClient.get<ApiSuccess<BudgetsPayload>>('/budgets', {
    params: {
      month: month !== undefined ? String(month) : undefined,
      year: year !== undefined ? String(year) : undefined,
    },
    signal,
  });

  return response.data.data.budgets;
}

/** Create a new budget for the authenticated user. */
export async function createBudget(input: BudgetInput): Promise<Budget> {
  const response = await apiClient.post<ApiSuccess<BudgetPayload>>('/budgets', input);

  return response.data.data.budget;
}

/** Update a budget's amount. */
export async function updateBudget(id: string, input: BudgetUpdateInput): Promise<Budget> {
  const response = await apiClient.patch<ApiSuccess<BudgetPayload>>(
    `/budgets/${encodeURIComponent(id)}`,
    input,
  );

  return response.data.data.budget;
}

/** Delete a budget. */
export async function deleteBudget(id: string): Promise<void> {
  await apiClient.delete(`/budgets/${encodeURIComponent(id)}`);
}

export type { Budget };
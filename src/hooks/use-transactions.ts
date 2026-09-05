import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createTransaction,
  deleteTransaction,
  fetchTransactions,
  updateTransaction,
  type TransactionFilters,
  type TransactionInput,
} from '@/api/transactions';
import { dashboardKeys } from '@/hooks/use-dashboard';

/**
 * Server state for `/transactions` (ARCHITECTURE.md §3). The filter set is part of the cache key,
 * so every combination is cached on its own and going back to a previous filter is instant.
 */

export const transactionKeys = {
  all: ['transactions'] as const,
  page: (filters: TransactionFilters) => ['transactions', filters] as const,
};

export function useTransactions(filters: TransactionFilters) {
  return useQuery({
    queryKey: transactionKeys.page(filters),
    queryFn: ({ signal }) => fetchTransactions(filters, signal),
    /** Keeps the previous page on screen while the next filter loads, instead of flashing empty. */
    placeholderData: keepPreviousData,
  });
}

/** Every write to the ledger changes what the dashboard totals, so both caches are retired. */
function invalidateLedger(queryClient: ReturnType<typeof useQueryClient>): Promise<void> {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: transactionKeys.all }),
    queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
  ]).then(() => undefined);
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: TransactionInput) => createTransaction(input),
    onSuccess: () => invalidateLedger(queryClient),
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<TransactionInput> }) =>
      updateTransaction(id, input),
    onSuccess: () => invalidateLedger(queryClient),
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => invalidateLedger(queryClient),
  });
}

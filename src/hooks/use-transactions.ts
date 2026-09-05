import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createTransaction,
  deleteTransaction,
  fetchTransactions,
  updateTransaction,
  type TransactionFilters,
  type TransactionInput,
} from '@/api/transactions';

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

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: TransactionInput) => createTransaction(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: transactionKeys.all }),
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<TransactionInput> }) =>
      updateTransaction(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: transactionKeys.all }),
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: transactionKeys.all }),
  });
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createCategory,
  deleteCategory,
  fetchCategories,
  renameCategory,
  type CreateCategoryInput,
} from '@/api/categories';
import { dashboardKeys } from '@/hooks/use-dashboard';
import { transactionKeys } from '@/hooks/use-transactions';

/**
 * Server state for `/categories` (ARCHITECTURE.md §3). The list is small and unfiltered, so one
 * cache entry serves the whole app and the filter bar reads it without a request of its own.
 */

export const categoryKeys = { all: ['categories'] as const };

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.all,
    queryFn: ({ signal }) => fetchCategories(signal),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCategoryInput) => createCategory(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: categoryKeys.all }),
  });
}

/**
 * A rename and a delete both change what the transaction rows show, and a delete moves that
 * category's spending into the dashboard's uncategorised slice, so all three lists refresh.
 */
function invalidateAffected(queryClient: ReturnType<typeof useQueryClient>): Promise<void> {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: categoryKeys.all }),
    queryClient.invalidateQueries({ queryKey: transactionKeys.all }),
    queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
  ]).then(() => undefined);
}

export function useRenameCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => renameCategory(id, name),
    onSuccess: () => invalidateAffected(queryClient),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => invalidateAffected(queryClient),
  });
}

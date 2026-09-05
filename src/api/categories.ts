import { apiClient } from './client';

import type {
  ApiSuccess,
  CategoriesPayload,
  CategoryPayload,
  TransactionType,
} from '@/types/api';

/**
 * `/categories` calls (ARCHITECTURE.md §7). Every function returns the payload the API sent and
 * lets the error surface, so the hooks above decide what a failure means.
 */

export interface CreateCategoryInput {
  name: string;
  type: TransactionType;
}

export async function fetchCategories(signal?: AbortSignal) {
  const response = await apiClient.get<ApiSuccess<CategoriesPayload>>('/categories', { signal });

  return response.data.data.categories;
}

export async function createCategory(input: CreateCategoryInput) {
  const response = await apiClient.post<ApiSuccess<CategoryPayload>>('/categories', input);

  return response.data.data.category;
}

export async function renameCategory(id: string, name: string) {
  const response = await apiClient.patch<ApiSuccess<CategoryPayload>>(
    `/categories/${encodeURIComponent(id)}`,
    { name },
  );

  return response.data.data.category;
}

export async function deleteCategory(id: string): Promise<void> {
  await apiClient.delete(`/categories/${encodeURIComponent(id)}`);
}

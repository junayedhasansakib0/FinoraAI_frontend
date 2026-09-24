import { apiClient } from './client';

import type { ApiSuccess, Goal, GoalPayload, GoalsPayload } from '@/types/api';

/** `/savings-goals` calls (ARCHITECTURE.md §7). */

/** Input for creating a goal. `currentAmount` is optional; omitted, the goal starts at zero. */
export interface GoalInput {
  name: string;
  targetAmount: string;
  currentAmount?: string;
  /** ISO-8601 date (`YYYY-MM-DD`) or instant; must be in the future. */
  deadline: string;
}

/** Input for updating a goal: any subset of the editable fields. */
export interface GoalUpdateInput {
  name?: string;
  targetAmount?: string;
  currentAmount?: string;
  deadline?: string;
}

/** List every goal for the authenticated user, soonest deadline first. */
export async function listGoals(signal?: AbortSignal): Promise<Goal[]> {
  const response = await apiClient.get<ApiSuccess<GoalsPayload>>('/savings-goals', { signal });

  return response.data.data.goals;
}

/** Create a goal for the authenticated user. */
export async function createGoal(input: GoalInput): Promise<Goal> {
  const response = await apiClient.post<ApiSuccess<GoalPayload>>('/savings-goals', input);

  return response.data.data.goal;
}

/** Update a goal, including a progress update to `currentAmount`. */
export async function updateGoal(id: string, input: GoalUpdateInput): Promise<Goal> {
  const response = await apiClient.patch<ApiSuccess<GoalPayload>>(
    `/savings-goals/${encodeURIComponent(id)}`,
    input,
  );

  return response.data.data.goal;
}

/** Delete a goal. */
export async function deleteGoal(id: string): Promise<void> {
  await apiClient.delete(`/savings-goals/${encodeURIComponent(id)}`);
}

export type { Goal };

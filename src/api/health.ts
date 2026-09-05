import { apiClient } from './client';

import type { ApiSuccess, HealthStatus } from '@/types/api';

/** `GET /health` — public endpoint used to confirm the API is reachable. */
export async function fetchHealth(signal?: AbortSignal): Promise<HealthStatus> {
  const response = await apiClient.get<ApiSuccess<HealthStatus>>('/health', { signal });

  return response.data.data;
}

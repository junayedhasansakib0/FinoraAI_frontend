import { apiClient } from './client';

import type { ApiSuccess, SessionPayload } from '@/types/api';

/**
 * `/auth` calls (ARCHITECTURE.md §7). Tokens are set as httpOnly cookies by the API, so these
 * functions never see or store a credential — they only return the user.
 */

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export async function registerAccount(payload: RegisterPayload) {
  const response = await apiClient.post<ApiSuccess<SessionPayload>>('/auth/register', payload);

  return response.data.data.user;
}

export async function login(payload: LoginPayload) {
  const response = await apiClient.post<ApiSuccess<SessionPayload>>('/auth/login', payload);

  return response.data.data.user;
}

export async function fetchCurrentUser(signal?: AbortSignal) {
  const response = await apiClient.get<ApiSuccess<SessionPayload>>('/auth/me', { signal });

  return response.data.data.user;
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}

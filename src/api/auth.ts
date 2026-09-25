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

/** At least one field must be present; the server rejects an empty body (§7). */
export interface UpdateProfilePayload {
  name?: string;
  currency?: string;
  timezone?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
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

export async function updateProfile(payload: UpdateProfilePayload) {
  const response = await apiClient.patch<ApiSuccess<SessionPayload>>('/auth/profile', payload);

  return response.data.data.user;
}

/**
 * Changing the password bumps the account's `tokenVersion`, retiring every refresh token already
 * issued. The API re-issues fresh cookies for this caller in the same response (§7), so the session
 * the change was made from stays signed in; only other devices are logged out.
 */
export async function changePassword(payload: ChangePasswordPayload) {
  const response = await apiClient.post<ApiSuccess<SessionPayload>>(
    '/auth/change-password',
    payload,
  );

  return response.data.data.user;
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}

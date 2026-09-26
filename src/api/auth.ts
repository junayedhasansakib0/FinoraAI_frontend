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

/**
 * The outcome of redeeming a verification token (§5). The endpoint always answers 200 with one of
 * these — never an error — so it reveals nothing and is not an oracle; the client renders the state.
 */
export type VerifyEmailStatus = 'verified' | 'expired' | 'invalid';

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

/**
 * Redeems a verification token from the emailed link (§5). Resolves to the rendered status; the
 * server never errors on a bad token, so a rejection here means the request itself failed
 * (network/5xx), which the caller shows as a generic "try again" state.
 */
export async function verifyEmail(token: string): Promise<VerifyEmailStatus> {
  const response = await apiClient.post<ApiSuccess<{ status: VerifyEmailStatus }>>(
    '/auth/verify-email',
    { token },
  );

  return response.data.data.status;
}

/**
 * Asks for a fresh verification email (§5). The API's response is deliberately generic whether or
 * not the address is a known, unverified account (anti-enumeration), so there is nothing to return;
 * a rejection is only ever a transport failure or the resend rate limit (429 `RATE_LIMITED`).
 */
export async function resendVerification(email: string): Promise<void> {
  await apiClient.post('/auth/resend-verification', { email });
}

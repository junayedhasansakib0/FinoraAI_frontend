/**
 * Public runtime configuration. Everything in this file is inlined into the browser bundle,
 * so no secret may ever be added here.
 */

function withoutTrailingSlash(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

/** Falls back to the relative path handled by the Vite dev proxy (see `vite.config.ts`). */
export const API_BASE_URL = withoutTrailingSlash(
  configuredApiBaseUrl && configuredApiBaseUrl.length > 0 ? configuredApiBaseUrl : '/api/v1',
);

export const REQUEST_TIMEOUT_MS = 15_000;

export const APP_NAME = 'Finora AI';

/**
 * How many months of history the dashboard charts ask for. The API defaults to the same six and
 * will not serve more than twelve, so this is the one place the number is chosen (R-N5).
 */
export const ANALYTICS_MONTHS = 6;

/**
 * The longest question the AI Chat accepts (ARCHITECTURE.md §7). Mirrors the server's
 * `AI_CHAT_QUESTION_MAX`; the client caps first so an over-long question never leaves the browser,
 * and the server still enforces it (R-V1). Kept in step with the contract by hand (R-N7).
 */
export const AI_CHAT_QUESTION_MAX = 500;

/** Every path the router knows about, in one place. */
export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  /** Public: redeems the token from a verification email (§5). Reachable signed in or out. */
  verifyEmail: '/verify-email',
  dashboard: '/app/dashboard',
  transactions: '/app/transactions',
  budgets: '/app/budgets',
  goals: '/app/goals',
  currency: '/app/currency',
  crypto: '/app/crypto',
  ai: '/app/ai',
  aiChat: '/app/ai/chat',
  analytics: '/app/analytics',
  settings: '/app/settings',
} as const;

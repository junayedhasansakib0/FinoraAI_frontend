/**
 * Response types mirrored by hand from the API contract in `ARCHITECTURE.md` §7. The client
 * is a separate repository and never imports server code (R-N7), so these must be updated
 * alongside the contract.
 */

export interface ApiSuccess<TData> {
  success: true;
  data: TData;
}

export interface ApiFailure {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface HealthStatus {
  status: 'ok';
  uptimeSeconds: number;
  timestamp: string;
}

/** `User` as returned by `/auth/*` — no token, no password hash, ever (§6). */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  currency: string;
  timezone: string;
  /** ISO-8601 timestamp. */
  createdAt: string;
}

export interface SessionPayload {
  user: AuthUser;
}

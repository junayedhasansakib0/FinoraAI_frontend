import { createContext, useContext } from 'react';

import type { LoginPayload, RegisterPayload } from '@/api/auth';
import type { AuthUser } from '@/types/api';

/**
 * The context object and its hook live apart from `AuthContext.tsx` because fast refresh only
 * works on a module whose exports are all components.
 */

export interface AuthContextValue {
  /** `null` means signed out — never "not loaded yet"; read `isRestoringSession` for that. */
  user: AuthUser | null;
  /** True until the boot `GET /auth/me` settles, so guards never decide on a guess. */
  isRestoringSession: boolean;
  signIn: (payload: LoginPayload) => Promise<void>;
  signUp: (payload: RegisterPayload) => Promise<void>;
  signOut: () => Promise<void>;
  /**
   * Replaces the in-memory user after a profile or password change, so the header and every
   * currency-formatted figure reflect the new values without a page reload.
   */
  applyUser: (user: AuthUser) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error('useAuth was used outside of AuthProvider.');
  }

  return value;
}

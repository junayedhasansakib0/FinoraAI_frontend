import { createContext, useContext } from 'react';

import type { LoginPayload } from '@/api/auth';
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
  signOut: () => Promise<void>;
  /**
   * Adopts a user into the in-memory session: after a profile or password change so the header and
   * every currency-formatted figure reflect the new values, and after registration to activate the
   * session once the "check your email" step has been shown — both without a page reload.
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

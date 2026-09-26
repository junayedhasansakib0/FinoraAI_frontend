import { useCallback, useEffect, useMemo, useState } from 'react';

import { fetchCurrentUser, login, logout } from '@/api/auth';
import { onSessionExpired } from '@/api/interceptors';

import { AuthContext } from './auth-context';

import type { LoginPayload } from '@/api/auth';
import type { AuthContextValue } from './auth-context';
import type { AuthUser } from '@/types/api';
import type { ReactNode } from 'react';

/**
 * Holds the signed-in user for the whole app (ARCHITECTURE.md §3). The session itself lives in
 * httpOnly cookies, so boot has to ask the API who the visitor is — there is nothing to read
 * locally, and nothing to clean up on sign-out beyond this state.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isRestoringSession, setIsRestoringSession] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    fetchCurrentUser(controller.signal)
      .then((restored) => {
        if (active) {
          setUser(restored);
        }
      })
      .catch(() => {
        // No usable session — including after a failed silent refresh. Stay signed out.
      })
      .finally(() => {
        if (active) {
          setIsRestoringSession(false);
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  // A refresh that fails mid-session ends it, wherever the request came from.
  useEffect(() => onSessionExpired(() => setUser(null)), []);

  const signIn = useCallback(async (payload: LoginPayload) => {
    setUser(await login(payload));
  }, []);

  const signOut = useCallback(async () => {
    try {
      await logout();
    } catch {
      // The cookies may already have expired; the session ends on this side regardless.
    }

    setUser(null);
  }, []);

  const applyUser = useCallback((next: AuthUser) => {
    setUser(next);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isRestoringSession, signIn, signOut, applyUser }),
    [user, isRestoringSession, signIn, signOut, applyUser],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

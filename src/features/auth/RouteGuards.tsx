import { Navigate, Outlet } from 'react-router';

import { useAuth } from '@/context/auth-context';
import { ROUTES } from '@/lib/constants';

/**
 * Both guards read a session that has already settled — `App` holds routing until the boot
 * `GET /auth/me` answers — so neither can redirect on a guess.
 */

/** Signed-out visitors are sent to sign in. */
export function ProtectedRoute() {
  const { user } = useAuth();

  return user ? <Outlet /> : <Navigate to={ROUTES.login} replace />;
}

/** Signed-in people have no use for the sign-in or registration pages. */
export function PublicOnlyRoute() {
  const { user } = useAuth();

  return user ? <Navigate to={ROUTES.home} replace /> : <Outlet />;
}

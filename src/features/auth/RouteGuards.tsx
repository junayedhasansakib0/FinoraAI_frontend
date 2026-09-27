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

  if (!user) {
    return <Navigate to={ROUTES.login} replace />;
  }

  // Private product area: React 19 hoists this into <head> so no /app/* screen is indexed
  // (defense in depth alongside `Disallow: /app/` in robots.txt).
  return (
    <>
      <meta name="robots" content="noindex, nofollow" />
      <Outlet />
    </>
  );
}

/** Signed-in people have no use for the sign-in or registration pages. */
export function PublicOnlyRoute() {
  const { user } = useAuth();

  return user ? <Navigate to={ROUTES.home} replace /> : <Outlet />;
}

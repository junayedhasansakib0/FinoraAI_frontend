import { BrowserRouter, Navigate, Route, Routes } from 'react-router';

import { SessionLoading } from '@/components/states/SessionLoading';
import { AuthProvider } from '@/context/AuthContext';
import { useAuth } from '@/context/auth-context';
import { ProtectedRoute, PublicOnlyRoute } from '@/features/auth/RouteGuards';
import { ROUTES } from '@/lib/constants';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ScaffoldPage from '@/pages/ScaffoldPage';

/**
 * Routing waits for the boot session check, so a guard never redirects on an unknown session.
 * `/` is the signed-in placeholder until Phase 5 moves the app under `/app/*`.
 */
function AppRoutes() {
  const { isRestoringSession } = useAuth();

  if (isRestoringSession) {
    return <SessionLoading />;
  }

  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path={ROUTES.login} element={<LoginPage />} />
        <Route path={ROUTES.register} element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path={ROUTES.home} element={<ScaffoldPage />} />
      </Route>

      <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

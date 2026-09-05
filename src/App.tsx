import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';

import { SessionLoading } from '@/components/states/SessionLoading';
import { AuthProvider } from '@/context/AuthContext';
import { useAuth } from '@/context/auth-context';
import { ProtectedRoute, PublicOnlyRoute } from '@/features/auth/RouteGuards';
import { ROUTES } from '@/lib/constants';
import { queryClient } from '@/lib/query-client';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import TransactionsPage from '@/pages/TransactionsPage';

/**
 * Routing waits for the boot session check, so a guard never redirects on an unknown session.
 * `/` is where a signed-in person belongs, which for now is the ledger; Phase 13 gives that slot
 * to the landing page and the dashboard.
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
        <Route path={ROUTES.home} element={<Navigate to={ROUTES.transactions} replace />} />
        <Route path={ROUTES.transactions} element={<TransactionsPage />} />
      </Route>

      <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

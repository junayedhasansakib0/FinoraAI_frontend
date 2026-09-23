import { QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';

import { RouteLoading } from '@/components/states/RouteLoading';
import { SessionLoading } from '@/components/states/SessionLoading';
import { AuthProvider } from '@/context/AuthContext';
import { useAuth } from '@/context/auth-context';
import { ProtectedRoute, PublicOnlyRoute } from '@/features/auth/RouteGuards';
import { ROUTES } from '@/lib/constants';
import { queryClient } from '@/lib/query-client';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';

/**
 * Each `/app/*` page is its own chunk (R-L4), which is what keeps Recharts — only ever imported by
 * the dashboard — out of the bundle a signed-out visitor downloads to reach the sign-in form.
 */
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const TransactionsPage = lazy(() => import('@/pages/TransactionsPage'));
const BudgetsPage = lazy(() => import('@/pages/BudgetsPage'));

/**
 * Routing waits for the boot session check, so a guard never redirects on an unknown session.
 * `/` is where a signed-in person belongs, which is the dashboard; Phase 13 gives that slot to the
 * landing page and moves the redirect behind the guard.
 */
function AppRoutes() {
  const { isRestoringSession } = useAuth();

  if (isRestoringSession) {
    return <SessionLoading />;
  }

  return (
    <Suspense fallback={<RouteLoading />}>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path={ROUTES.login} element={<LoginPage />} />
          <Route path={ROUTES.register} element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path={ROUTES.home} element={<Navigate to={ROUTES.dashboard} replace />} />
          <Route path={ROUTES.dashboard} element={<DashboardPage />} />
          <Route path={ROUTES.transactions} element={<TransactionsPage />} />
          <Route path={ROUTES.budgets} element={<BudgetsPage />} />
        </Route>

        <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
      </Routes>
    </Suspense>
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

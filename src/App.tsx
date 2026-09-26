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
const GoalsPage = lazy(() => import('@/pages/GoalsPage'));
const CurrencyPage = lazy(() => import('@/pages/CurrencyPage'));
const CryptoPage = lazy(() => import('@/pages/CryptoPage'));
const AiInsightsPage = lazy(() => import('@/pages/AiInsightsPage'));
const AiChatPage = lazy(() => import('@/pages/AiChatPage'));
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const VerifyEmailPage = lazy(() => import('@/pages/VerifyEmailPage'));

/**
 * Routing waits for the boot session check, so a guard never redirects on an unknown session.
 * `/` is the public landing page and adapts its calls to action to the session; signed-in visitors
 * reach their real routes under `/app/*` behind `ProtectedRoute`.
 */
function AppRoutes() {
  const { isRestoringSession } = useAuth();

  if (isRestoringSession) {
    return <SessionLoading />;
  }

  return (
    <Suspense fallback={<RouteLoading />}>
      <Routes>
        <Route path={ROUTES.home} element={<LandingPage />} />

        <Route path={ROUTES.verifyEmail} element={<VerifyEmailPage />} />

        <Route element={<PublicOnlyRoute />}>
          <Route path={ROUTES.login} element={<LoginPage />} />
          <Route path={ROUTES.register} element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path={ROUTES.dashboard} element={<DashboardPage />} />
          <Route path={ROUTES.transactions} element={<TransactionsPage />} />
          <Route path={ROUTES.budgets} element={<BudgetsPage />} />
          <Route path={ROUTES.goals} element={<GoalsPage />} />
          <Route path={ROUTES.currency} element={<CurrencyPage />} />
          <Route path={ROUTES.crypto} element={<CryptoPage />} />
          <Route path={ROUTES.ai} element={<AiInsightsPage />} />
          <Route path={ROUTES.aiChat} element={<AiChatPage />} />
          <Route path={ROUTES.analytics} element={<AnalyticsPage />} />
          <Route path={ROUTES.settings} element={<SettingsPage />} />
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

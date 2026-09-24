import { NavLink } from 'react-router';

import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/auth-context';
import { APP_NAME, ROUTES } from '@/lib/constants';

import type { ReactNode } from 'react';

/** Only the routes that exist. Phase 13 replaces this with the sidebar/drawer/bottom-nav shell. */
const NAV_ITEMS = [
  { to: ROUTES.dashboard, label: 'Dashboard' },
  { to: ROUTES.transactions, label: 'Transactions' },
  { to: ROUTES.budgets, label: 'Budgets' },
  { to: ROUTES.goals, label: 'Goals' },
  { to: ROUTES.currency, label: 'Currency' },
  { to: ROUTES.crypto, label: 'Crypto' },
  { to: ROUTES.ai, label: 'AI Insights' },
] as const;

const NAV_LINK_BASE = 'border-b-2 pb-0.5 transition-colors';

/** The signed-in frame: wordmark, where you are, who you are, and the way out. */
export function AppShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-line">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-8 gap-y-3 px-6 py-4">
          <span className="font-semibold tracking-tight">{APP_NAME}</span>

          <nav aria-label="Sections" className="flex items-center gap-6 text-sm">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive
                    ? `${NAV_LINK_BASE} border-ink`
                    : `${NAV_LINK_BASE} border-transparent text-muted hover:text-ink`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-4">
            {user !== null && (
              <span className="hidden text-sm text-muted sm:inline">{user.name}</span>
            )}
            <Button
              variant="quiet"
              size="sm"
              onClick={() => {
                void signOut();
              }}
            >
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">{children}</main>
    </div>
  );
}

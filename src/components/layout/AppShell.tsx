import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';

import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/auth-context';
import { UnverifiedEmailBanner } from '@/features/auth/UnverifiedEmailBanner';
import { APP_NAME, ROUTES } from '@/lib/constants';

import type { ReactNode } from 'react';

/** Every signed-in destination, in the order it appears in both the sidebar and the mobile drawer. */
const NAV_ITEMS = [
  { to: ROUTES.dashboard, label: 'Dashboard' },
  { to: ROUTES.transactions, label: 'Transactions' },
  { to: ROUTES.budgets, label: 'Budgets' },
  { to: ROUTES.goals, label: 'Goals' },
  { to: ROUTES.analytics, label: 'Analytics' },
  { to: ROUTES.currency, label: 'Currency' },
  { to: ROUTES.crypto, label: 'Crypto' },
  { to: ROUTES.ai, label: 'AI Insights' },
  { to: ROUTES.aiChat, label: 'AI Chat' },
  { to: ROUTES.settings, label: 'Settings' },
] as const;

const NAV_LINK_BASE = 'block border-l-2 py-2 pl-4 text-sm transition-colors';

/** The one nav list, rendered in the desktop sidebar and again in the mobile drawer. */
function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <ul className="space-y-0.5">
      {NAV_ITEMS.map((item) => (
        <li key={item.to}>
          <NavLink
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              isActive
                ? `${NAV_LINK_BASE} border-ink font-medium text-ink`
                : `${NAV_LINK_BASE} border-transparent text-muted hover:text-ink`
            }
          >
            {item.label}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

/**
 * The signed-in frame (§10): a fixed sidebar from `lg` up, and below it a top bar whose menu opens a
 * drawer holding the same nav. The drawer closes on navigation, on the overlay, and on Escape, the
 * three ways a person expects out of an overlay.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!drawerOpen) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setDrawerOpen(false);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [drawerOpen]);

  const identity =
    user === null ? null : <p className="mb-3 truncate text-sm text-muted">{user.name}</p>;

  const signOutButton = (
    <Button
      variant="quiet"
      size="sm"
      onClick={() => {
        void signOut();
      }}
    >
      Sign out
    </Button>
  );

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <aside className="hidden border-r border-line lg:flex lg:w-64 lg:shrink-0 lg:flex-col">
        <div className="px-6 py-5">
          <NavLink to={ROUTES.dashboard} className="font-semibold tracking-tight">
            {APP_NAME}
          </NavLink>
        </div>
        <nav aria-label="Sections" className="flex-1 overflow-y-auto px-4 py-2">
          <NavItems />
        </nav>
        <div className="border-t border-line px-6 py-4">
          {identity}
          {signOutButton}
        </div>
      </aside>

      <header className="flex items-center justify-between border-b border-line px-4 py-3 lg:hidden">
        <span className="font-semibold tracking-tight">{APP_NAME}</span>
        <button
          type="button"
          aria-expanded={drawerOpen}
          aria-controls="app-drawer"
          onClick={() => {
            setDrawerOpen(true);
          }}
          className="border border-line px-3 py-1.5 text-sm transition-colors hover:border-ink"
        >
          Menu
        </button>
      </header>

      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            tabIndex={-1}
            onClick={() => {
              setDrawerOpen(false);
            }}
            className="absolute inset-0 bg-ink/40"
          />
          <div
            id="app-drawer"
            className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-paper"
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <span className="font-semibold tracking-tight">{APP_NAME}</span>
              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                }}
                className="text-sm text-muted transition-colors hover:text-ink"
              >
                Close
              </button>
            </div>
            <nav aria-label="Sections" className="flex-1 overflow-y-auto px-4 py-3">
              <NavItems
                onNavigate={() => {
                  setDrawerOpen(false);
                }}
              />
            </nav>
            <div className="border-t border-line px-6 py-4">
              {identity}
              {signOutButton}
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        {user !== null && !user.emailVerified && <UnverifiedEmailBanner email={user.email} />}
        {children}
      </main>
    </div>
  );
}

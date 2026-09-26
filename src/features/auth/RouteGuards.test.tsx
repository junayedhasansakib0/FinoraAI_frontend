import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';

import { AuthContext } from '@/context/auth-context';
import { ROUTES } from '@/lib/constants';

import { ProtectedRoute, PublicOnlyRoute } from './RouteGuards';

import type { AuthContextValue } from '@/context/auth-context';
import type { AuthUser } from '@/types/api';

/**
 * The route guards (R-T5). They read a session that has already settled, so each test hands the
 * context a decided `user` (a person or `null`) and asserts where the guard sends them — never a
 * redirect on a guess.
 */

const person: AuthUser = {
  id: 'usr_1',
  name: 'Ada',
  email: 'ada@example.com',
  currency: 'USD',
  timezone: 'UTC',
  emailVerified: true,
  createdAt: '2026-01-01T00:00:00.000Z',
};

function authValue(user: AuthUser | null): AuthContextValue {
  return {
    user,
    isRestoringSession: false,
    signIn: () => Promise.resolve(),
    signOut: () => Promise.resolve(),
    applyUser: () => undefined,
  };
}

function renderAt(path: string, user: AuthUser | null) {
  return render(
    <AuthContext.Provider value={authValue(user)}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/app" element={<p>protected content</p>} />
          </Route>
          <Route element={<PublicOnlyRoute />}>
            <Route path={ROUTES.login} element={<p>sign in</p>} />
          </Route>
          <Route path={ROUTES.home} element={<p>home</p>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('ProtectedRoute', () => {
  it('shows the protected outlet to a signed-in person', () => {
    renderAt('/app', person);

    expect(screen.getByText('protected content')).toBeInTheDocument();
  });

  it('redirects a signed-out visitor to sign in', () => {
    renderAt('/app', null);

    expect(screen.getByText('sign in')).toBeInTheDocument();
    expect(screen.queryByText('protected content')).not.toBeInTheDocument();
  });
});

describe('PublicOnlyRoute', () => {
  it('lets a signed-out visitor reach the public page', () => {
    renderAt(ROUTES.login, null);

    expect(screen.getByText('sign in')).toBeInTheDocument();
  });

  it('sends a signed-in person away from the public page to home', () => {
    renderAt(ROUTES.login, person);

    expect(screen.getByText('home')).toBeInTheDocument();
    expect(screen.queryByText('sign in')).not.toBeInTheDocument();
  });
});

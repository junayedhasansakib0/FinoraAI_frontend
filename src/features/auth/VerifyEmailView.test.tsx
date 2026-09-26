import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthContext } from '@/context/auth-context';

import { VerifyEmailView } from './VerifyEmailView';

import type { AuthContextValue } from '@/context/auth-context';
import type { AuthUser } from '@/types/api';

/**
 * The dedicated verify-email page (§5). The endpoint never errors on a bad token — it answers a
 * status the page renders — so the states verified/expired/invalid come from the resolved value,
 * "already" is derived from a signed-in verified user without spending the token, and only a thrown
 * request (transport/5xx) reaches the "something went wrong" state. The API is mocked (R-T4).
 */

const { verifyEmail, resendVerification } = vi.hoisted(() => ({
  verifyEmail: vi.fn(),
  resendVerification: vi.fn(() => Promise.resolve()),
}));

vi.mock('@/api/auth', () => ({ verifyEmail, resendVerification }));

const UNVERIFIED: AuthUser = {
  id: 'u1',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  currency: 'USD',
  timezone: 'UTC',
  emailVerified: false,
  createdAt: '2026-01-01T00:00:00.000Z',
};

function renderView({ token, user }: { token?: string; user?: AuthUser | null } = {}) {
  const value: AuthContextValue = {
    user: user ?? null,
    isRestoringSession: false,
    signIn: () => Promise.resolve(),
    signOut: () => Promise.resolve(),
    applyUser: () => undefined,
  };
  const path = token === undefined ? '/verify-email' : `/verify-email?token=${token}`;

  render(
    <MemoryRouter initialEntries={[path]}>
      <AuthContext.Provider value={value}>
        <VerifyEmailView />
      </AuthContext.Provider>
    </MemoryRouter>,
  );
}

describe('VerifyEmailView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('confirms a good token', async () => {
    verifyEmail.mockResolvedValue('verified');
    renderView({ token: 'good-token' });

    expect(await screen.findByText('Email verified')).toBeInTheDocument();
    expect(verifyEmail).toHaveBeenCalledWith('good-token');
  });

  it('reports an expired token', async () => {
    verifyEmail.mockResolvedValue('expired');
    renderView({ token: 'stale-token' });

    expect(await screen.findByText('This link has expired')).toBeInTheDocument();
  });

  it('treats a missing token as invalid without a request', async () => {
    renderView();

    expect(await screen.findByText("This link isn't valid")).toBeInTheDocument();
    expect(verifyEmail).not.toHaveBeenCalled();
  });

  it('tells an already-verified visitor without spending the token', async () => {
    renderView({ token: 'any-token', user: { ...UNVERIFIED, emailVerified: true } });

    expect(await screen.findByText('Already verified')).toBeInTheDocument();
    expect(verifyEmail).not.toHaveBeenCalled();
  });

  it('shows a retryable error when the request itself fails', async () => {
    verifyEmail.mockRejectedValue(new Error('network'));
    renderView({ token: 'good-token' });

    expect(await screen.findByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });

  it('lets a signed-in visitor resend from an expired link', async () => {
    verifyEmail.mockResolvedValue('expired');
    renderView({ token: 'stale-token', user: UNVERIFIED });

    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Resend link' }));

    expect(resendVerification).toHaveBeenCalledWith('ada@example.com');
    expect(
      await screen.findByText('If that address needs confirming, a new link is on its way.'),
    ).toBeInTheDocument();
  });
});

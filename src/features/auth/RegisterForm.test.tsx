import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError } from 'axios';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthContext } from '@/context/auth-context';

import { RegisterForm } from './RegisterForm';

import type { AuthContextValue } from '@/context/auth-context';
import type { AuthUser } from '@/types/api';

/**
 * The two-step registration flow (§5): client-side validation blocks a bad form, a success shows the
 * "check your email" panel WITHOUT signing in (the session is activated only on Continue), the live
 * strength meter reacts to typing, and a taken email (CONFLICT) lands on the email field. The API is
 * mocked (R-T4); no redirect is asserted here beyond the handoff `applyUser` call.
 */

const { registerAccount, resendVerification } = vi.hoisted(() => ({
  registerAccount: vi.fn(),
  resendVerification: vi.fn(() => Promise.resolve()),
}));

vi.mock('@/api/auth', () => ({ registerAccount, resendVerification }));

const USER: AuthUser = {
  id: 'u1',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  currency: 'USD',
  timezone: 'UTC',
  emailVerified: false,
  createdAt: '2026-01-01T00:00:00.000Z',
};

function renderForm(applyUser = vi.fn()) {
  const value: AuthContextValue = {
    user: null,
    isRestoringSession: false,
    signIn: () => Promise.resolve(),
    signOut: () => Promise.resolve(),
    applyUser,
  };

  render(
    <MemoryRouter>
      <AuthContext.Provider value={value}>
        <RegisterForm />
      </AuthContext.Provider>
    </MemoryRouter>,
  );

  return { applyUser };
}

function conflict(message: string): AxiosError {
  return new AxiosError('conflict', 'ERR_BAD_REQUEST', undefined, undefined, {
    status: 409,
    statusText: 'Conflict',
    headers: {},
    config: {} as never,
    data: { success: false, error: { code: 'CONFLICT', message } },
  });
}

async function fillValid(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Name'), 'Ada Lovelace');
  await user.type(screen.getByLabelText('Email'), 'ada@example.com');
  await user.type(screen.getByLabelText('Password'), 'Str0ng!Pass');
  await user.type(screen.getByLabelText('Confirm'), 'Str0ng!Pass');
}

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('blocks submission and shows a field error when empty', async () => {
    renderForm();

    await userEvent.setup().click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText('Enter your name.')).toBeInTheDocument();
    expect(registerAccount).not.toHaveBeenCalled();
  });

  it('grades the password live as it is typed', async () => {
    renderForm();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Password'), 'abc');

    expect(screen.getByText('Weak')).toBeInTheDocument();
    expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
  });

  it('shows the check-your-email panel then hands off on Continue', async () => {
    registerAccount.mockResolvedValue(USER);
    const { applyUser } = renderForm();
    const user = userEvent.setup();

    await fillValid(user);
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText('Check your email')).toBeInTheDocument();
    expect(registerAccount).toHaveBeenCalledWith({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'Str0ng!Pass',
    });

    await user.click(screen.getByRole('button', { name: 'Continue to Finora' }));
    expect(applyUser).toHaveBeenCalledWith(USER);
  });

  it('puts a taken email on the email field', async () => {
    registerAccount.mockRejectedValue(conflict('That email is already registered.'));
    renderForm();
    const user = userEvent.setup();

    await fillValid(user);
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText('That email is already registered.')).toBeInTheDocument();
  });
});

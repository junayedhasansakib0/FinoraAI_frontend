import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { AuthContext } from '@/context/auth-context';

import { LoginForm } from './LoginForm';

import type { AuthContextValue } from '@/context/auth-context';

/**
 * The sign-in form (R-T5 "forms"): client-side validation before anything leaves the browser, the
 * happy path that hands the values to `signIn`, and the API failure surfaced as an alert. No
 * redirect is asserted — the route guard owns that, not the form.
 */

function renderForm(signIn: AuthContextValue['signIn']) {
  const value: AuthContextValue = {
    user: null,
    isRestoringSession: false,
    signIn,
    signOut: () => Promise.resolve(),
    applyUser: () => undefined,
  };

  return render(
    <AuthContext.Provider value={value}>
      <LoginForm />
    </AuthContext.Provider>,
  );
}

describe('LoginForm', () => {
  it('blocks submission and shows field errors when empty', async () => {
    const signIn = vi.fn(() => Promise.resolve());
    renderForm(signIn);

    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Enter your password.')).toBeInTheDocument();
    expect(signIn).not.toHaveBeenCalled();
  });

  it('hands valid credentials to signIn', async () => {
    const signIn = vi.fn(() => Promise.resolve());
    renderForm(signIn);

    await userEvent.type(screen.getByLabelText('Email'), 'ada@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'secret12');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(signIn).toHaveBeenCalledWith({ email: 'ada@example.com', password: 'secret12' });
  });

  it('surfaces a failed sign-in as an alert', async () => {
    const signIn = vi.fn(() => Promise.reject(new Error('boom')));
    renderForm(signIn);

    await userEvent.type(screen.getByLabelText('Email'), 'ada@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'secret12');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });
});

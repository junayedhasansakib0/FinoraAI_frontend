import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FeatureLocked } from './FeatureLocked';

/**
 * The locked state shown in place of a verified-only feature (Analytics, AI) while the account's
 * email is unconfirmed. It renders the gate's copy and the one action that moves the person forward
 * — resending the verification link — reusing the shared resend hook. The API is mocked (R-T4).
 */

const { resendVerification } = vi.hoisted(() => ({
  resendVerification: vi.fn(() => Promise.resolve()),
}));

vi.mock('@/api/auth', () => ({ resendVerification }));

describe('FeatureLocked', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the title, message and where the link was sent', () => {
    render(
      <FeatureLocked
        title="Analytics are locked"
        message="Verify your email to unlock your financial insights and analytics."
        email="ada@example.com"
      />,
    );

    expect(screen.getByText('Analytics are locked')).toBeInTheDocument();
    expect(
      screen.getByText('Verify your email to unlock your financial insights and analytics.'),
    ).toBeInTheDocument();
    expect(screen.getByText('ada@example.com')).toBeInTheDocument();
  });

  it('resends the verification link to the account email and reports it', async () => {
    render(
      <FeatureLocked
        title="AI features are locked"
        message="Verify your email to start using Finora AI."
        email="grace@example.com"
      />,
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Resend verification email' }));

    expect(resendVerification).toHaveBeenCalledWith('grace@example.com');
    expect(
      await screen.findByText('If that address needs confirming, a new link is on its way.'),
    ).toBeInTheDocument();
  });
});

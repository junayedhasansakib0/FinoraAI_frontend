import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { UnavailableState } from './UnavailableState';

/**
 * The shared state components (R-T5 "state components"): empty, error, and degraded-source. The
 * roles matter for assistive tech — an error is an `alert`, a degraded source only a `status` — so
 * the tests pin those alongside the retry wiring.
 */

describe('EmptyState', () => {
  it('renders the title, message, and an optional action', () => {
    render(
      <EmptyState title="No transactions yet" message="Add your first one." action={<button>Add</button>} />,
    );

    expect(screen.getByText('No transactions yet')).toBeInTheDocument();
    expect(screen.getByText('Add your first one.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });

  it('omits the action region when none is given', () => {
    render(<EmptyState title="Empty" message="Nothing here." />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

describe('ErrorState', () => {
  it('is announced as an alert and can retry', async () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Could not load." onRetry={onRetry} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('disables the button and changes the label while retrying', () => {
    render(<ErrorState message="Could not load." onRetry={() => undefined} retrying />);

    const button = screen.getByRole('button', { name: 'Trying again…' });
    expect(button).toBeDisabled();
  });

  it('shows no retry button when no handler is provided', () => {
    render(<ErrorState message="Could not load." />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

describe('UnavailableState', () => {
  it('is announced as a status, not an alarm', () => {
    render(<UnavailableState message="Rates are unavailable right now." />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

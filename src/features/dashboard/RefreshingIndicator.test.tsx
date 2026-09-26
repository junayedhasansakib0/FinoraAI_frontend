import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { RefreshingIndicator } from './RefreshingIndicator';

/**
 * The dashboard's "refreshing" cue (UX for the stale-then-refetch window): visible with a status
 * role while a background refetch is in flight, and nothing at all otherwise — so the initial load,
 * which never sets `active`, keeps showing only the full skeleton.
 */
describe('RefreshingIndicator', () => {
  it('announces a refresh while active', () => {
    render(<RefreshingIndicator active={true} />);

    expect(screen.getByRole('status')).toHaveTextContent('Refreshing…');
  });

  it('renders nothing while inactive', () => {
    const { container } = render(<RefreshingIndicator active={false} />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(container).toBeEmptyDOMElement();
  });
});

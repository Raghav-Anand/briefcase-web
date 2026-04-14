import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it.each([
    ['active',     'Active'],
    ['paused',     'Paused'],
    ['completed',  'Completed'],
    ['archived',   'Archived'],
    ['auto_closed','Auto-closed'],
    ['open',       'Open'],
    ['bug',        'Bug'],
    ['idea',       'Idea'],
    ['todo',       'Todo'],
    ['general',    'General'],
  ])('renders label "%s" for status "%s"', (status, label) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('falls back gracefully for unknown statuses', () => {
    render(<StatusBadge status="unknown_xyz" />);
    expect(screen.getByText('unknown_xyz')).toBeInTheDocument();
  });

  it('applies extra className', () => {
    const { container } = render(<StatusBadge status="active" className="my-extra-class" />);
    expect(container.firstChild).toHaveClass('my-extra-class');
  });
});

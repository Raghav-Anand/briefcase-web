import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState title="Nothing here" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<EmptyState title="T" description="Some detail" />);
    expect(screen.getByText('Some detail')).toBeInTheDocument();
  });

  it('renders icon', () => {
    render(<EmptyState icon="🚀" title="T" />);
    expect(screen.getByText('🚀')).toBeInTheDocument();
  });

  it('renders action button and fires callback', async () => {
    const onClick = vi.fn();
    render(<EmptyState title="T" action={{ label: 'Do it', onClick }} />);
    await userEvent.click(screen.getByRole('button', { name: 'Do it' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not render action button when action is not provided', () => {
    render(<EmptyState title="T" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { ProtectedRoute } from './ProtectedRoute';
import { AuthContext, type AuthContextType } from './AuthProvider';

function renderWithAuth(authValue: Partial<AuthContextType>, initialPath = '/protected') {
  const defaults: AuthContextType = {
    user: null,
    idToken: null,
    loading: false,
    onGoogleSuccess: vi.fn(),
    signOut: vi.fn(),
  };

  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthContext.Provider value={{ ...defaults, ...authValue }}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<div>Protected content</div>} />
          </Route>
          <Route path="/" element={<div>Landing page</div>} />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  it('renders outlet when user is authenticated', () => {
    renderWithAuth({ user: { email: 'a@b.com', display_name: 'Alice' } });
    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  it('redirects to "/" when user is not authenticated', () => {
    renderWithAuth({ user: null });
    expect(screen.getByText('Landing page')).toBeInTheDocument();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('shows spinner while loading', () => {
    const { container } = renderWithAuth({ user: null, loading: true });
    // Spinner rendered — no landing page, no protected content
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
    expect(screen.queryByText('Landing page')).not.toBeInTheDocument();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });
});

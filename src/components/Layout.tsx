import { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

const LOGO_URL = 'https://storage.googleapis.com/briefcase-planner-static/logo.png';

function NavLogo() {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <span className="flex items-center gap-3">
      {/* Icon slot: logo image when it loads, SVG fallback if it doesn't */}
      {imgFailed ? (
        <svg className="w-6 h-6 text-brand-500 shrink-0" viewBox="0 0 32 32" fill="currentColor">
          <rect x="4" y="12" width="24" height="16" rx="3" />
          <path d="M11 12V9a5 5 0 0 1 10 0v3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </svg>
      ) : (
        <img
          src={LOGO_URL}
          alt=""
          className="h-9 w-auto"
          onError={() => setImgFailed(true)}
        />
      )}
      {/* Wordmark: always visible regardless of image state */}
      <span className="font-semibold text-slate-100 text-base tracking-tight">Briefcase</span>
    </span>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const onLanding = location.pathname === '/';

  function handleSignOut() {
    signOut();
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Nav — full viewport width, no max-w constraint */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur border-b border-slate-800/80">
        <div className="px-6 sm:px-10 h-16 flex items-center justify-between">

          {/* Left: brand */}
          <Link to={user ? '/dashboard' : '/'} className="shrink-0">
            <NavLogo />
          </Link>

          {/* Right: nav links + auth — grouped so the middle is intentionally empty */}
          <div className="flex items-center gap-1">
            {user && (
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-base transition-colors ${
                    isActive
                      ? 'text-slate-100 bg-slate-800'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                Dashboard
              </NavLink>
            )}
            <NavLink
              to="/setup"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-base transition-colors ${
                  isActive
                    ? 'text-slate-100 bg-slate-800'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              Setup
            </NavLink>

            {/* Only show Sign in when not already on the landing page */}
            {!user && !onLanding && (
              <>
                <div className="w-px h-5 bg-slate-800 mx-1" />
                <Link
                  to="/"
                  className="text-slate-400 hover:text-slate-200 text-base px-4 py-2 rounded-lg hover:bg-slate-800/60 transition-colors"
                >
                  Sign in
                </Link>
              </>
            )}

            {/* When on the landing page and not signed in: CTA scrolls to sign-in card */}
            {!user && onLanding && (
              <>
                <div className="w-px h-5 bg-slate-800 mx-1" />
                <a
                  href="#signin"
                  className="text-base px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white transition-colors"
                >
                  Get started
                </a>
              </>
            )}

            {user && (
              <>
                <div className="w-px h-5 bg-slate-800 mx-1" />
                <div className="flex items-center gap-2">
                  {user.photo_url ? (
                    <img
                      src={user.photo_url}
                      alt={user.display_name}
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-full ring-1 ring-slate-700 hidden sm:block"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-brand-700 flex items-center justify-center text-sm font-medium text-white hidden sm:flex">
                      {user.display_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="text-slate-400 hover:text-slate-200 text-base px-4 py-2 rounded-lg hover:bg-slate-800/60 transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 animate-fade-in">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} Briefcase</span>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-slate-400 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-slate-400 transition-colors">Terms</Link>
            <Link to="/setup" className="hover:text-slate-400 transition-colors">MCP Setup</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

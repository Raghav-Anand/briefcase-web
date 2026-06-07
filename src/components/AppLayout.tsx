import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { useProjects } from '../hooks/useProjects';
import { NewProjectModal } from './NewProjectModal';
import type { Project } from '../types';

// ── Helpers ───────────────────────────────────────────────────────────────────

const BUBBLE_PALETTE = [
  '#e8821a', '#c2410c', '#7c3aed', '#0891b2',
  '#059669', '#db2777', '#2563eb', '#0f766e',
  '#9333ea', '#ca8a04',
];

function bubbleColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return BUBBLE_PALETTE[Math.abs(h) % BUBBLE_PALETTE.length];
}

function initials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

const STATUS_DOT: Record<string, string> = {
  active:    '#22c55e',
  paused:    '#f59e0b',
  completed: '#818cf8',
  archived:  '#334155',
};

// ── Project bubble ────────────────────────────────────────────────────────────

interface BubbleProps {
  project: Project;
  isActive: boolean;
  onMouseEnter: (e: React.MouseEvent<HTMLAnchorElement>, p: Project) => void;
  onMouseLeave: () => void;
}

function ProjectBubble({ project, isActive, onMouseEnter, onMouseLeave }: BubbleProps) {
  const color = bubbleColor(project.name);
  const dotColor = STATUS_DOT[project.status] ?? '#334155';

  return (
    <div className="relative flex items-center justify-center w-full py-[3px]">
      {/* Active indicator bar */}
      <span
        className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full bg-white transition-all duration-200 ease-out ${
          isActive ? 'h-10 opacity-100' : 'h-3 opacity-0'
        }`}
      />

      <Link
        to={`/projects/${project.id}`}
        onMouseEnter={(e) => onMouseEnter(e, project)}
        onMouseLeave={onMouseLeave}
        className="relative flex items-center justify-center"
      >
        {/* Bubble */}
        <div
          className={`w-11 h-11 flex items-center justify-center text-white text-xs font-bold tracking-wide select-none transition-all duration-150 ease-out ${
            isActive ? 'rounded-2xl shadow-lg' : 'rounded-3xl hover:rounded-2xl'
          }`}
          style={{ backgroundColor: color, boxShadow: isActive ? `0 0 0 2px ${color}40, 0 4px 12px ${color}30` : undefined }}
        >
          {initials(project.name)}
        </div>

        {/* Status dot */}
        <span
          className="absolute -bottom-[1px] -right-[1px] w-[10px] h-[10px] rounded-full border-2 border-[#090704] transition-colors"
          style={{ backgroundColor: dotColor }}
        />
      </Link>
    </div>
  );
}

// ── Sidebar icon button ───────────────────────────────────────────────────────

interface SidebarBtnProps {
  onClick?: () => void;
  href?: string;
  isActive?: boolean;
  onMouseEnter?: (e: React.MouseEvent<HTMLElement>) => void;
  onMouseLeave?: () => void;
  children: React.ReactNode;
}

function SidebarBtn({ onClick, href, isActive, onMouseEnter, onMouseLeave, children }: SidebarBtnProps) {
  const cls = `w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 ${
    isActive
      ? 'bg-ink-700 text-slate-100'
      : 'text-slate-500 hover:text-slate-200 hover:bg-ink-800/80'
  }`;
  if (href) {
    return (
      <Link to={href} className={cls} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        {children}
      </Link>
    );
  }
  return (
    <button onClick={onClick} className={cls} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      {children}
    </button>
  );
}

// ── AppLayout ─────────────────────────────────────────────────────────────────

interface TooltipState {
  label: string;
  sublabel?: string;
  y: number;
}

const LOGO_URL = 'https://storage.googleapis.com/briefcase-planner-static/logo.png';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { projects, create } = useProjects();

  const [showModal, setShowModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [logoFailed, setLogoFailed] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const activeProjectId = location.pathname.startsWith('/projects/')
    ? location.pathname.split('/')[2]
    : null;

  useEffect(() => {
    if (!showUserMenu) return;
    function onOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [showUserMenu]);

  function showTip(e: React.MouseEvent<HTMLElement>, label: string, sublabel?: string) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setTooltip({ label, sublabel, y: rect.top + rect.height / 2 });
  }

  function hideTip() {
    setTooltip(null);
  }

  function handleSignOut() {
    signOut();
    navigate('/');
  }

  return (
    <div className="flex h-screen overflow-hidden bg-ink-900">

      {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
      <aside className="w-[76px] flex-shrink-0 bg-[#090704] border-r border-ink-800/80 flex flex-col items-center py-3 z-20">

        {/* Logo */}
        <Link
          to="/dashboard"
          className="mb-2 flex items-center justify-center"
          onMouseEnter={(e) => showTip(e, 'Dashboard')}
          onMouseLeave={hideTip}
        >
          {logoFailed ? (
            <div className="w-11 h-11 rounded-xl bg-brand-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" viewBox="0 0 32 32" fill="currentColor">
                <rect x="4" y="12" width="24" height="16" rx="3" />
                <path d="M11 12V9a5 5 0 0 1 10 0v3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              </svg>
            </div>
          ) : (
            <img
              src={LOGO_URL}
              alt="Briefcase"
              className="h-11 w-auto rounded-xl"
              onError={() => setLogoFailed(true)}
            />
          )}
        </Link>

        {/* Divider */}
        <div className="w-12 h-px bg-ink-800 mb-3" />

        {/* Project bubbles */}
        <div className="flex-1 w-full overflow-y-auto overflow-x-clip flex flex-col items-center gap-0.5">
          {projects.map((project) => (
            <ProjectBubble
              key={project.id}
              project={project}
              isActive={activeProjectId === project.id}
              onMouseEnter={(e, p) =>
                showTip(
                  e as React.MouseEvent<HTMLElement>,
                  p.name,
                  p.open_milestone_count > 0
                    ? `${p.open_milestone_count} open milestone${p.open_milestone_count !== 1 ? 's' : ''}`
                    : undefined
                )
              }
              onMouseLeave={hideTip}
            />
          ))}
        </div>

        {/* Divider */}
        <div className="w-12 h-px bg-ink-800 mt-3 mb-3" />

        {/* Bottom actions */}
        <div className="flex flex-col items-center gap-1.5">
          {/* New project */}
          <SidebarBtn
            onClick={() => setShowModal(true)}
            onMouseEnter={(e) => showTip(e, 'New project')}
            onMouseLeave={hideTip}
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M8 3v10M3 8h10" />
            </svg>
          </SidebarBtn>

          {/* Setup */}
          <SidebarBtn
            href="/setup"
            isActive={location.pathname === '/setup'}
            onMouseEnter={(e) => showTip(e, 'Setup')}
            onMouseLeave={hideTip}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </SidebarBtn>

          {/* User avatar */}
          {user && (
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setShowUserMenu((v) => !v)}
                onMouseEnter={(e) => showTip(e, user.display_name, user.email)}
                onMouseLeave={hideTip}
                className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center ring-1 ring-transparent hover:ring-brand-500/50 transition-all duration-150"
              >
                {user.photo_url ? (
                  <img src={user.photo_url} alt={user.display_name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-brand-700 flex items-center justify-center text-white text-xs font-bold">
                    {user.display_name.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>

              {showUserMenu && (
                <div className="absolute bottom-0 left-11 z-50 bg-ink-900 border border-ink-700/80 rounded-xl shadow-2xl p-1.5 min-w-[196px] animate-fade-in">
                  <div className="px-3 py-2 mb-1">
                    <p className="text-slate-200 text-sm font-semibold truncate">{user.display_name}</p>
                    <p className="text-slate-500 text-xs truncate mt-0.5">{user.email}</p>
                  </div>
                  <div className="h-px bg-ink-800 mx-1 mb-1" />
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-3 py-2 text-slate-400 hover:text-slate-100 hover:bg-ink-800/60 rounded-lg text-sm transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* ── Fixed tooltip (avoids overflow clipping) ─────────────────────────── */}
      {tooltip && (
        <div
          className="fixed left-[66px] z-[9999] pointer-events-none"
          style={{ top: tooltip.y, transform: 'translateY(-50%)' }}
        >
          <div className="bg-ink-900 border border-ink-700/60 text-slate-100 text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl flex items-center gap-2">
            {tooltip.label}
            {tooltip.sublabel && (
              <span className="text-slate-400 font-normal">{tooltip.sublabel}</span>
            )}
          </div>
        </div>
      )}

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 overflow-y-auto flex flex-col">
        <main className="flex-1 w-full max-w-7xl mx-auto px-6 sm:px-10 py-8 animate-fade-in">
          {children}
        </main>

        <footer className="border-t border-ink-600/50 py-5 mt-auto">
          <div className="px-6 sm:px-10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
            <span>© {new Date().getFullYear()} Briefcase</span>
            <div className="flex gap-4">
              <Link to="/privacy" className="hover:text-slate-400 transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-slate-400 transition-colors">Terms</Link>
              <Link to="/setup" className="hover:text-slate-400 transition-colors">MCP Setup</Link>
            </div>
          </div>
        </footer>
      </div>

      {/* New project modal */}
      {showModal && (
        <NewProjectModal onClose={() => setShowModal(false)} onCreate={create} />
      )}
    </div>
  );
}

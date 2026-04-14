import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { StatusBadge } from '../components/StatusBadge';
import { SessionTimeline } from '../components/SessionTimeline';
import { MilestoneList } from '../components/MilestoneList';
import { DecisionLog } from '../components/DecisionLog';
import { NoteList } from '../components/NoteList';
import { RepoList } from '../components/RepoList';
import { EmptyState } from '../components/EmptyState';
import { useProject } from '../hooks/useProject';
import { useSessions } from '../hooks/useSessions';
import { api } from '../api/client';
import type { RepoDoc, DocsResponse } from '../types';

type Tab = 'overview' | 'sessions' | 'milestones' | 'decisions' | 'notes' | 'docs' | 'repos';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview',   label: 'Overview' },
  { id: 'sessions',   label: 'Sessions' },
  { id: 'milestones', label: 'Milestones' },
  { id: 'decisions',  label: 'Decisions' },
  { id: 'notes',      label: 'Notes' },
  { id: 'docs',       label: 'Docs' },
  { id: 'repos',      label: 'Repos' },
];

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso));
}

function DocsList({ projectId }: { projectId: string }) {
  const [docs, setDocs] = useState<RepoDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<DocsResponse>(`/api/projects/${projectId}/docs`)
      .then((res) => setDocs(res.docs))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) return <div className="h-32 bg-slate-900 border border-slate-800 rounded-xl animate-pulse" />;
  if (error) return <p className="text-red-400 text-sm">{error}</p>;
  if (docs.length === 0) {
    return (
      <EmptyState
        icon="📄"
        title="No docs yet"
        description="Claude uploads docs and architecture diagrams during sessions. They appear here."
      />
    );
  }

  const FORMAT_ICON: Record<string, string> = { markdown: '📝', mermaid: '📐' };
  const TYPE_LABEL: Record<string, string> = {
    api_docs:     'API Docs',
    architecture: 'Architecture',
    readme:       'README',
    custom:       'Custom',
  };

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {docs.map((doc) => (
        <Link
          key={doc.id}
          to={`/projects/${projectId}/docs/${doc.id}`}
          className="group bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 hover:bg-slate-800/50 transition-all"
        >
          <div className="flex items-start gap-3">
            <span className="text-xl mt-0.5">{FORMAT_ICON[doc.format] ?? '📄'}</span>
            <div className="flex-1 min-w-0">
              <p className="text-slate-200 font-medium text-sm group-hover:text-white transition-colors line-clamp-1">
                {doc.title}
              </p>
              <p className="text-slate-500 text-xs mt-0.5">
                {TYPE_LABEL[doc.doc_type] ?? doc.doc_type} · v{doc.version} · {formatDate(doc.updated_at)}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [archiving, setArchiving] = useState(false);

  const { project, loading, error, archive } = useProject(id!);
  const { sessions, loading: sessionsLoading, hasMore, loadMore } = useSessions(id!);

  async function handleArchive() {
    if (!window.confirm('Archive this project? It will be hidden from your dashboard.')) return;
    setArchiving(true);
    try {
      await archive();
      navigate('/dashboard');
    } catch (e) {
      console.error(e);
      setArchiving(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="space-y-4">
          <div className="h-8 w-64 bg-slate-800 rounded-lg animate-pulse" />
          <div className="h-4 w-96 bg-slate-800 rounded animate-pulse" />
          <div className="h-32 bg-slate-900 border border-slate-800 rounded-xl animate-pulse" />
        </div>
      </Layout>
    );
  }

  if (error || !project) {
    return (
      <Layout>
        <EmptyState
          icon="⚠️"
          title="Project not found"
          description={error ?? 'This project does not exist or you do not have access.'}
          action={{ label: '← Back to dashboard', onClick: () => navigate('/dashboard') }}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link to="/dashboard" className="hover:text-slate-300 transition-colors">Dashboard</Link>
        <span>/</span>
        <span className="text-slate-300">{project.name}</span>
      </nav>

      {/* Project header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h1 className="text-slate-100 text-2xl font-bold leading-tight">{project.name}</h1>
          <div className="flex items-center gap-2 shrink-0">
            <StatusBadge status={project.status} />
            <button
              onClick={handleArchive}
              disabled={archiving}
              className="text-slate-500 hover:text-slate-300 text-xs px-2 py-1 rounded hover:bg-slate-800 transition-colors"
            >
              {archiving ? 'Archiving…' : 'Archive'}
            </button>
          </div>
        </div>
        {project.description && (
          <p className="text-slate-400 text-sm leading-relaxed mb-3">{project.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          {project.repo_url && (
            <a
              href={project.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-brand-400 transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
              </svg>
              {project.repo_url.replace(/^https?:\/\/(www\.)?/, '')}
            </a>
          )}
          {project.tech_stack?.map((t) => (
            <span key={t} className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded">{t}</span>
          ))}
          <span>Updated {formatDate(project.updated_at)}</span>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Sessions',         value: sessions.length, extra: sessionsLoading ? '…' : '' },
          { label: 'Open milestones',  value: project.open_milestone_count },
        ].map((stat) => (
          <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <p className="text-slate-100 text-2xl font-bold">{stat.value}{stat.extra}</p>
            <p className="text-slate-500 text-xs mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-800 mb-6">
        <div className="flex gap-1 -mb-px overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-brand-500 text-brand-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="animate-fade-in">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {project.last_session_summary ? (
              <div>
                <h3 className="text-slate-300 text-sm font-medium mb-3">Last session summary</h3>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-300 text-sm leading-relaxed">
                  {project.last_session_summary}
                </div>
              </div>
            ) : (
              <EmptyState
                icon="💬"
                title="No sessions yet"
                description="Connect Claude to start the first session on this project."
                action={{ label: 'View setup →', onClick: () => navigate('/setup') }}
              />
            )}
          </div>
        )}

        {activeTab === 'sessions' && (
          <div>
            <SessionTimeline sessions={sessions} projectId={id!} />
            {hasMore && (
              <div className="mt-4 text-center">
                <button
                  onClick={loadMore}
                  className="px-4 py-2 text-slate-400 hover:text-slate-200 text-sm hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Load more sessions
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'milestones'  && <MilestoneList projectId={id!} />}
        {activeTab === 'decisions'   && <DecisionLog  projectId={id!} />}
        {activeTab === 'notes'       && <NoteList     projectId={id!} />}
        {activeTab === 'docs'        && <DocsList     projectId={id!} />}
        {activeTab === 'repos'       && <RepoList     projectId={id!} />}
      </div>
    </Layout>
  );
}

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import { api } from '../api/client';
import type { SessionDetail as ISessionDetail } from '../types';

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso));
}

function formatDuration(start: string, end?: string): string {
  const ms = new Date(end ?? new Date()).getTime() - new Date(start).getTime();
  const mins = Math.floor(ms / 60_000);
  if (mins < 1) return '< 1m';
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

const CLIENT_LABELS: Record<string, string> = {
  claude_desktop: 'Claude Desktop',
  claude_code:    'Claude Code',
  claude_web:     'claude.ai',
  unknown:        'Unknown client',
};

export function SessionDetail() {
  const { id: projectId, sid } = useParams<{ id: string; sid: string }>();
  const [session, setSession] = useState<ISessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logOpen, setLogOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get<ISessionDetail>(`/api/projects/${projectId}/sessions/${sid}`)
      .then((res) => setSession(res))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [projectId, sid]);

  if (loading) {
    return (
      <Layout>
        <div className="space-y-4">
          <div className="h-4 w-48 bg-slate-800 rounded animate-pulse" />
          <div className="h-8 w-96 bg-slate-800 rounded-lg animate-pulse" />
          <div className="h-40 bg-slate-900 border border-slate-800 rounded-xl animate-pulse" />
        </div>
      </Layout>
    );
  }

  if (error || !session) {
    return (
      <Layout>
        <EmptyState icon="⚠️" title="Session not found" description={error ?? undefined} />
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6 flex-wrap">
        <Link to="/dashboard" className="hover:text-slate-300 transition-colors">Dashboard</Link>
        <span>/</span>
        <Link to={`/projects/${projectId}`} className="hover:text-slate-300 transition-colors">Project</Link>
        <span>/</span>
        <span className="text-slate-300">Session</span>
      </nav>

      {/* Session header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-slate-100 font-semibold text-lg mb-1">
              {formatDate(session.started_at)}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
              <span>Duration: {formatDuration(session.started_at, session.ended_at)}</span>
              <span>{CLIENT_LABELS[session.client_type] ?? session.client_type}</span>
              <span>{session.tool_call_count} tool calls</span>
              {session.auto_closed && <span className="text-orange-400">Auto-closed</span>}
            </div>
          </div>
          <StatusBadge status={session.status} className="shrink-0" />
        </div>
      </div>

      <div className="space-y-6">
        {/* Summary */}
        <section>
          <h2 className="text-slate-300 text-sm font-medium uppercase tracking-wide mb-3">Summary</h2>
          {session.summary ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-300 text-sm leading-relaxed">
              {session.summary}
            </div>
          ) : (
            <p className="text-slate-600 text-sm italic">No summary recorded for this session.</p>
          )}
        </section>

        {/* Next steps */}
        {session.next_steps && session.next_steps.length > 0 && (
          <section>
            <h2 className="text-slate-300 text-sm font-medium uppercase tracking-wide mb-3">Next steps</h2>
            <ul className="space-y-2">
              {session.next_steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1 w-5 h-5 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-400 text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-slate-300 text-sm">{step}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Decisions */}
        {session.decisions && session.decisions.length > 0 && (
          <section>
            <h2 className="text-slate-300 text-sm font-medium uppercase tracking-wide mb-3">
              Decisions this session
            </h2>
            <ul className="space-y-2">
              {session.decisions.map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-brand-400 mt-0.5">·</span>
                  {d}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Tool call log */}
        {session.tool_call_log && session.tool_call_log.length > 0 && (
          <section>
            <button
              onClick={() => setLogOpen((v) => !v)}
              className="flex items-center gap-2 text-slate-300 text-sm font-medium uppercase tracking-wide mb-3 hover:text-slate-100 transition-colors"
            >
              <svg
                className={`w-4 h-4 transition-transform ${logOpen ? 'rotate-90' : ''}`}
                viewBox="0 0 20 20" fill="currentColor"
              >
                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02z" clipRule="evenodd" />
              </svg>
              Tool call log ({session.tool_call_log.length})
            </button>

            {logOpen && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-left">
                      <th className="px-4 py-2.5 text-slate-400 font-medium">Tool</th>
                      <th className="px-4 py-2.5 text-slate-400 font-medium">Args</th>
                      <th className="px-4 py-2.5 text-slate-400 font-medium">Result</th>
                      <th className="px-4 py-2.5 text-slate-400 font-medium whitespace-nowrap">Called at</th>
                    </tr>
                  </thead>
                  <tbody>
                    {session.tool_call_log.map((log) => (
                      <tr key={log.id} className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30">
                        <td className="px-4 py-2.5 text-brand-400 font-mono whitespace-nowrap">{log.tool_name}</td>
                        <td className="px-4 py-2.5 text-slate-400 font-mono max-w-xs">
                          <pre className="truncate">{JSON.stringify(log.args)}</pre>
                        </td>
                        <td className="px-4 py-2.5 text-slate-400">{log.result ?? '—'}</td>
                        <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap">
                          {new Date(log.called_at).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>
    </Layout>
  );
}

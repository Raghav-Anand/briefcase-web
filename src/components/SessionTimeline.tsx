import { Link } from 'react-router-dom';
import type { Session } from '../types';
import { StatusBadge } from './StatusBadge';
import { EmptyState } from './EmptyState';

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
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

interface SessionTimelineProps {
  sessions: Session[];
  projectId: string;
}

export function SessionTimeline({ sessions, projectId }: SessionTimelineProps) {
  if (sessions.length === 0) {
    return (
      <EmptyState
        icon="🗓️"
        title="No sessions yet"
        description="Sessions appear here after Claude connects and calls start_session."
      />
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((session, i) => (
        <Link
          key={session.id}
          to={`/projects/${projectId}/sessions/${session.id}`}
          className="group block bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 hover:bg-slate-800/50 transition-all"
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              {/* Timeline dot */}
              <span
                className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                  i === 0 ? 'bg-emerald-400' : 'bg-slate-600'
                }`}
              />
              <span className="text-slate-300 text-sm font-medium">
                {formatDate(session.started_at)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={session.status} />
              <span className="text-slate-500 text-xs">
                {CLIENT_LABELS[session.client_type] ?? session.client_type}
              </span>
            </div>
          </div>

          <div className="pl-4">
            {session.summary ? (
              <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 mb-2">
                {session.summary}
              </p>
            ) : (
              <p className="text-slate-600 text-sm italic mb-2">No summary.</p>
            )}

            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span>Duration: {formatDuration(session.started_at, session.ended_at)}</span>
              <span>{session.tool_call_count} tool call{session.tool_call_count !== 1 ? 's' : ''}</span>
              {session.auto_closed && (
                <span className="text-orange-500">Auto-closed</span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

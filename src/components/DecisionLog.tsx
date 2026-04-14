import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import type { Decision, DecisionsResponse } from '../types';
import { EmptyState } from './EmptyState';

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso));
}

interface DecisionLogProps {
  projectId: string;
}

export function DecisionLog({ projectId }: DecisionLogProps) {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api.get<DecisionsResponse>(`/api/projects/${projectId}/decisions`)
      .then((res) => setDecisions(res.decisions))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) return <LoadingRows />;
  if (error) return <p className="text-red-400 text-sm">{error}</p>;

  if (decisions.length === 0) {
    return (
      <EmptyState
        icon="⚖️"
        title="No decisions logged"
        description="Claude logs architectural and design decisions during sessions. They appear here for future reference."
      />
    );
  }

  return (
    <div className="space-y-3">
      {decisions.map((d) => (
        <div key={d.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          {/* Decision */}
          <p className="text-slate-100 font-medium text-sm mb-2">{d.decision}</p>

          {/* Rationale */}
          {d.rationale && (
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-3 mb-3">
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-1">Rationale</p>
              <p className="text-slate-300 text-sm">{d.rationale}</p>
            </div>
          )}

          {/* Tags + metadata */}
          <div className="flex flex-wrap items-center gap-2">
            {d.tags?.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded text-xs"
              >
                {tag}
              </span>
            ))}
            <span className="text-slate-500 text-xs ml-auto">{formatDate(d.created_at)}</span>
            {d.session_id && (
              <Link
                to={`/projects/${projectId}/sessions/${d.session_id}`}
                className="text-slate-500 hover:text-brand-400 text-xs transition-colors"
              >
                → session
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function LoadingRows() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 bg-slate-900 border border-slate-800 rounded-xl animate-pulse" />
      ))}
    </div>
  );
}

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { api } from '../api/client';
import type { Milestone, MilestonesResponse, CreateMilestoneInput } from '../types';
import { StatusBadge } from './StatusBadge';
import { EmptyState } from './EmptyState';

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso));
}

function milestoneMarkdown(m: Milestone): string {
  const lines: string[] = [`# ${m.title}`];
  if (m.due_date) lines.push(`**Due:** ${formatDate(m.due_date)}`);
  if (m.completed_at) lines.push(`**Completed:** ${formatDate(m.completed_at)}`);
  if (m.description) {
    lines.push('');
    lines.push(m.description);
  }
  return lines.join('\n');
}

interface MilestoneListProps {
  projectId: string;
}

export function MilestoneList({ projectId }: MilestoneListProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Milestone | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<CreateMilestoneInput>({ title: '', description: '', due_date: '' });

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<MilestonesResponse>(`/api/projects/${projectId}/milestones`);
      setMilestones(res.milestones);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [projectId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep selected in sync if milestones reload
  useEffect(() => {
    if (selected) {
      const updated = milestones.find((m) => m.id === selected.id);
      setSelected(updated ?? null);
    }
  }, [milestones]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/api/projects/${projectId}/milestones`, {
        title: form.title.trim(),
        ...(form.description?.trim() ? { description: form.description.trim() } : {}),
        ...(form.due_date ? { due_date: form.due_date } : {}),
      });
      setForm({ title: '', description: '', due_date: '' });
      setShowForm(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleComplete(id: string) {
    try {
      await api.post(`/api/projects/${projectId}/milestones/${id}/complete`, {});
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to complete');
    }
  }

  if (loading) return <LoadingRows />;

  return (
    <div className="flex gap-4 min-h-0">
      {/* Left: milestone list */}
      <div className={`flex flex-col gap-2 ${selected ? 'w-72 shrink-0' : 'flex-1'}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-slate-400 text-sm">
            {milestones.filter((m) => m.status === 'open').length} open ·{' '}
            {milestones.filter((m) => m.status === 'completed').length} completed
          </p>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {showForm ? 'Cancel' : '+ Add'}
          </button>
        </div>

        {/* Add form */}
        {showForm && (
          <form onSubmit={handleCreate} className="bg-slate-900 border border-slate-700 rounded-xl p-4 space-y-3">
            <div>
              <label className="block text-slate-300 text-sm mb-1">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Launch v1.0"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 text-sm mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Markdown supported"
                rows={3}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 text-sm mb-1">Due date</label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent [color-scheme:dark]"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {submitting ? 'Adding…' : 'Add milestone'}
            </button>
          </form>
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}

        {milestones.length === 0 ? (
          <EmptyState
            icon="🏁"
            title="No milestones"
            description="Add milestones to track major goals. Claude can also create them during sessions."
            action={{ label: '+ Add milestone', onClick: () => setShowForm(true) }}
          />
        ) : (
          <div className="space-y-1">
            {milestones.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelected(selected?.id === m.id ? null : m)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                  selected?.id === m.id
                    ? 'bg-slate-800 text-slate-100'
                    : 'hover:bg-slate-900 text-slate-300 hover:text-slate-100'
                }`}
              >
                {/* Status dot */}
                <span className={`w-2 h-2 rounded-full shrink-0 ${
                  m.status === 'completed' ? 'bg-emerald-500' : 'bg-brand-400'
                }`} />
                <span className={`text-sm truncate flex-1 ${m.status === 'completed' ? 'line-through text-slate-500' : ''}`}>
                  {m.title}
                </span>
                {m.due_date && m.status === 'open' && (
                  <span className="text-xs text-slate-500 shrink-0">{formatDate(m.due_date)}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: detail panel */}
      {selected && (
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-5 min-w-0">
          {/* Panel header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 min-w-0">
              <StatusBadge status={selected.status} />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {selected.status === 'open' && (
                <button
                  onClick={() => handleComplete(selected.id)}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  Mark complete
                </button>
              )}
              <button
                onClick={() => setSelected(null)}
                className="text-slate-500 hover:text-slate-300 transition-colors"
                title="Close"
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                  <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* Markdown content */}
          <div className="prose prose-sm prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{milestoneMarkdown(selected)}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingRows() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-10 bg-slate-900 border border-slate-800 rounded-lg animate-pulse" />
      ))}
    </div>
  );
}

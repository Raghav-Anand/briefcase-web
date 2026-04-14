import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { Milestone, MilestonesResponse, CreateMilestoneInput } from '../types';
import { StatusBadge } from './StatusBadge';
import { EmptyState } from './EmptyState';

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso));
}

interface MilestoneListProps {
  projectId: string;
}

export function MilestoneList({ projectId }: MilestoneListProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-slate-400 text-sm">
          {milestones.filter((m) => m.status === 'open').length} open ·{' '}
          {milestones.filter((m) => m.status === 'completed').length} completed
        </p>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {showForm ? 'Cancel' : '+ Add milestone'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-slate-900 border border-slate-700 rounded-xl p-4 mb-4 space-y-3">
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
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Optional detail"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
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
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {submitting ? 'Adding…' : 'Add milestone'}
            </button>
          </div>
        </form>
      )}

      {error && (
        <p className="text-red-400 text-sm mb-4">{error}</p>
      )}

      {milestones.length === 0 ? (
        <EmptyState
          icon="🏁"
          title="No milestones"
          description="Add milestones to track major goals. Claude can also create them during sessions."
          action={{ label: '+ Add milestone', onClick: () => setShowForm(true) }}
        />
      ) : (
        <div className="space-y-2">
          {milestones.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 bg-slate-900 border rounded-xl p-4 transition-colors ${
                m.status === 'completed' ? 'border-slate-800 opacity-60' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Checkbox */}
              <button
                onClick={() => m.status === 'open' && handleComplete(m.id)}
                disabled={m.status === 'completed'}
                title={m.status === 'open' ? 'Mark as completed' : 'Completed'}
                className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                  m.status === 'completed'
                    ? 'bg-emerald-500/20 border-emerald-500/50 cursor-default'
                    : 'border-slate-600 hover:border-brand-500 cursor-pointer'
                }`}
              >
                {m.status === 'completed' && (
                  <svg className="w-3 h-3 text-emerald-400" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-medium ${m.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                    {m.title}
                  </p>
                  <StatusBadge status={m.status} className="shrink-0" />
                </div>
                {m.description && (
                  <p className="text-slate-500 text-xs mt-0.5">{m.description}</p>
                )}
                <div className="flex gap-3 mt-1 text-xs text-slate-500">
                  {m.due_date && <span>Due {formatDate(m.due_date)}</span>}
                  {m.completed_at && <span>Completed {formatDate(m.completed_at)}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LoadingRows() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-16 bg-slate-900 border border-slate-800 rounded-xl animate-pulse" />
      ))}
    </div>
  );
}

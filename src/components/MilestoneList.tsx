import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { api } from '../api/client';
import type { AddTaskResponse, Milestone, MilestonesResponse, CreateMilestoneInput, MilestoneTask, Repo, ReposResponse } from '../types';
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
  const [tab, setTab] = useState<'open' | 'closed'>('open');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<CreateMilestoneInput>({ title: '', description: '', due_date: '' });

  // Repos (for task repo selector)
  const [repos, setRepos] = useState<Repo[]>([]);

  // Task state
  const [taskInput, setTaskInput] = useState('');
  const [taskRepo, setTaskRepo] = useState('');
  const [addingTask, setAddingTask] = useState(false);
  const [taskError, setTaskError] = useState<string | null>(null);
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
  const taskInputRef = useRef<HTMLInputElement>(null);

  async function load(showSpinner = true) {
    if (showSpinner) setLoading(true);
    setError(null);
    try {
      const [milestonesRes, reposRes] = await Promise.all([
        api.get<MilestonesResponse>(`/api/projects/${projectId}/milestones`),
        api.get<ReposResponse>(`/api/projects/${projectId}/repos`),
      ]);
      setMilestones(milestonesRes.milestones);
      setRepos(reposRes.repos);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      if (showSpinner) setLoading(false);
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
      await load(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleComplete(id: string) {
    try {
      await api.post(`/api/projects/${projectId}/milestones/${id}/complete`, {});
      setTab('closed');
      await load(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to complete');
    }
  }

  async function handleReopen(id: string) {
    try {
      await api.post(`/api/projects/${projectId}/milestones/${id}/uncomplete`, {});
      setTab('open');
      await load(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to reopen');
    }
  }

  async function handleCheckTask(milestoneId: string, task: MilestoneTask) {
    try {
      await api.patch(`/api/projects/${projectId}/milestones/${milestoneId}/tasks/${task.id}`, {
        completed: !task.completed,
      });
      await load(false);
    } catch (e) {
      setTaskError(e instanceof Error ? e.message : 'Failed to update task');
    }
  }

  async function handleAddTask(milestoneId: string) {
    if (!taskInput.trim()) return;
    setAddingTask(true);
    setTaskError(null);
    try {
      await api.post<AddTaskResponse>(`/api/projects/${projectId}/milestones/${milestoneId}/tasks`, {
        title: taskInput.trim(),
        ...(taskRepo ? { repo_name: taskRepo } : {}),
      });
      setTaskInput('');
      setTaskRepo('');
      await load(false);
      taskInputRef.current?.focus();
    } catch (e) {
      setTaskError(e instanceof Error ? e.message : 'Failed to add task');
    } finally {
      setAddingTask(false);
    }
  }

  async function handleRemoveTask(milestoneId: string, taskId: string) {
    try {
      await api.delete(`/api/projects/${projectId}/milestones/${milestoneId}/tasks/${taskId}`);
      await load(false);
    } catch (e) {
      setTaskError(e instanceof Error ? e.message : 'Failed to remove task');
    }
  }

  const openCount = milestones.filter((m) => m.status === 'open').length;
  const closedCount = milestones.filter((m) => m.status === 'completed').length;
  const visible = milestones.filter((m) => m.status === (tab === 'open' ? 'open' : 'completed'));

  if (loading) return <LoadingRows />;

  return (
    <div className="flex gap-4 min-h-0">
      {/* Left: milestone list */}
      <div className={`flex flex-col gap-2 ${selected ? 'w-72 shrink-0' : 'flex-1'}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 bg-slate-900 rounded-lg p-0.5">
            <button
              onClick={() => { setTab('open'); setSelected(null); }}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                tab === 'open'
                  ? 'bg-slate-700 text-slate-100'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Open{openCount > 0 && <span className="ml-1.5 text-xs opacity-70">{openCount}</span>}
            </button>
            <button
              onClick={() => { setTab('closed'); setSelected(null); }}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                tab === 'closed'
                  ? 'bg-slate-700 text-slate-100'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Closed{closedCount > 0 && <span className="ml-1.5 text-xs opacity-70">{closedCount}</span>}
            </button>
          </div>
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

        {visible.length === 0 ? (
          tab === 'open' ? (
            <EmptyState
              icon="🏁"
              title="No open milestones"
              description="Add milestones to track major goals. Claude can also create them during sessions."
              action={{ label: '+ Add milestone', onClick: () => setShowForm(true) }}
            />
          ) : (
            <EmptyState
              icon="✓"
              title="No closed milestones"
              description="Completed milestones will appear here."
            />
          )
        ) : (
          <div className="space-y-1">
            {visible.map((m) => (
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
                {/* Seq badge */}
                {m.seq > 0 && (
                  <span className="text-xs text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded font-mono shrink-0">
                    M-{m.seq}
                  </span>
                )}
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
              {selected.seq > 0 && (
                <span className="text-xs text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded font-mono">
                  M-{selected.seq}
                </span>
              )}
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
              {selected.status === 'completed' && (
                <button
                  onClick={() => handleReopen(selected.id)}
                  className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium rounded-lg transition-colors"
                >
                  Reopen
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
          <div className="prose prose-sm prose-invert prose-dark max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{milestoneMarkdown(selected)}</ReactMarkdown>
          </div>

          {/* Task checklist */}
          <div className="mt-4 border-t border-slate-800 pt-4">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Tasks</p>

            {taskError && <p className="text-red-400 text-xs mb-2">{taskError}</p>}

            {selected.tasks && selected.tasks.length > 0 ? (
              <ul className="space-y-1 mb-3">
                {selected.tasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center gap-2 group"
                    onMouseEnter={() => setHoveredTaskId(task.id)}
                    onMouseLeave={() => setHoveredTaskId(null)}
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleCheckTask(selected.id, task)}
                      className="w-3.5 h-3.5 rounded accent-brand-500 shrink-0 cursor-pointer"
                    />
                    <span className={`text-sm flex-1 ${task.completed ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                      {task.title}
                    </span>
                    {task.repo_name && (
                      <span className="text-xs text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded font-mono shrink-0">
                        {task.repo_name}
                      </span>
                    )}
                    {hoveredTaskId === task.id && (
                      <button
                        onClick={() => handleRemoveTask(selected.id, task.id)}
                        className="text-slate-600 hover:text-red-400 transition-colors shrink-0"
                        title="Remove task"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                          <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-600 text-xs mb-3">No tasks yet.</p>
            )}

            {/* Add task input */}
            <div className="flex flex-col gap-1.5">
              <div className="flex gap-2">
                <input
                  ref={taskInputRef}
                  type="text"
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      void handleAddTask(selected.id);
                    }
                  }}
                  placeholder="Add a task…"
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-transparent"
                />
                {repos.length > 0 && (
                  <select
                    value={taskRepo}
                    onChange={(e) => setTaskRepo(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-transparent"
                  >
                    <option value="">Repo</option>
                    {repos.map((r) => (
                      <option key={r.id} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => void handleAddTask(selected.id)}
                  disabled={addingTask || !taskInput.trim()}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-slate-200 text-xs font-medium rounded-lg transition-colors shrink-0"
                >
                  {addingTask ? '…' : 'Add'}
                </button>
              </div>
            </div>
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

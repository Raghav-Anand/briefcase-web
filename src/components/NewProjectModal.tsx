import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CreateProjectInput } from '../types';

interface NewProjectModalProps {
  onClose: () => void;
  onCreate: (input: CreateProjectInput) => Promise<string>;
}

export function NewProjectModal({ onClose, onCreate }: NewProjectModalProps) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', description: '', repo_url: '', tech_stack: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const input: CreateProjectInput = {
        name: form.name.trim(),
        ...(form.description.trim() ? { description: form.description.trim() } : {}),
        ...(form.repo_url.trim()    ? { repo_url: form.repo_url.trim() } : {}),
        ...(form.tech_stack.trim()
          ? { tech_stack: form.tech_stack.split(',').map((s) => s.trim()).filter(Boolean) }
          : {}),
      };
      const id = await onCreate(input);
      navigate(`/projects/${id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create project');
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-ink-800 border border-ink-600 rounded-2xl p-6 w-full max-w-md animate-fade-in shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-slate-100 font-semibold text-lg">New project</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-slate-800"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1.5">
              Project name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. My CLI Tool"
              className="w-full bg-ink-700 border border-ink-600 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Brief summary of what this project is"
              rows={2}
              className="w-full bg-ink-700 border border-ink-600 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1.5">Repo URL</label>
            <input
              type="url"
              value={form.repo_url}
              onChange={(e) => setForm((f) => ({ ...f, repo_url: e.target.value }))}
              placeholder="https://github.com/you/repo"
              className="w-full bg-ink-700 border border-ink-600 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1.5">
              Tech stack{' '}
              <span className="text-slate-500 font-normal">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={form.tech_stack}
              onChange={(e) => setForm((f) => ({ ...f, tech_stack: e.target.value }))}
              placeholder="Go, React, Firestore"
              className="w-full bg-ink-700 border border-ink-600 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={submitting || !form.name.trim()}
              className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
            >
              {submitting ? 'Creating…' : 'Create project'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-slate-400 hover:text-slate-200 text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

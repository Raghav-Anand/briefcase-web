import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { Repo, ReposResponse, CreateRepoInput } from '../types';
import { EmptyState } from './EmptyState';

const LANG_COLORS: Record<string, string> = {
  Go:         'bg-sky-500',
  TypeScript: 'bg-blue-500',
  JavaScript: 'bg-yellow-400',
  Python:     'bg-green-500',
  Rust:       'bg-orange-500',
  Java:       'bg-red-500',
  Ruby:       'bg-red-400',
  Swift:      'bg-orange-400',
  Kotlin:     'bg-purple-500',
  Dart:       'bg-teal-400',
};

function langDot(lang?: string) {
  const cls = lang ? (LANG_COLORS[lang] ?? 'bg-slate-500') : 'bg-slate-600';
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${cls}`} />;
}


interface RepoListProps {
  projectId: string;
}

export function RepoList({ projectId }: RepoListProps) {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<CreateRepoInput>({ name: '', url: '', description: '', language: '' });
  const [editing, setEditing] = useState<Repo | null>(null);
  const [editForm, setEditForm] = useState<CreateRepoInput>({ name: '', url: '', description: '', language: '' });
  const [removing, setRemoving] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<ReposResponse>(`/api/projects/${projectId}/repos`);
      setRepos(res.repos);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [projectId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.url.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/api/projects/${projectId}/repos`, {
        name: form.name.trim(),
        url: form.url.trim(),
        ...(form.description?.trim() ? { description: form.description.trim() } : {}),
        ...(form.language?.trim() ? { language: form.language.trim() } : {}),
      });
      setForm({ name: '', url: '', description: '', language: '' });
      setShowForm(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add');
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(repo: Repo) {
    setEditing(repo);
    setEditForm({ name: repo.name, url: repo.url, description: repo.description ?? '', language: repo.language ?? '' });
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editing || !editForm.name.trim() || !editForm.url.trim()) return;
    setSubmitting(true);
    try {
      await api.patch(`/api/projects/${projectId}/repos/${editing.id}`, {
        name: editForm.name.trim(),
        url: editForm.url.trim(),
        ...(editForm.description?.trim() ? { description: editForm.description.trim() } : { description: '' }),
        ...(editForm.language?.trim() ? { language: editForm.language.trim() } : { language: '' }),
      });
      setEditing(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(repoId: string) {
    if (!window.confirm('Remove this repo from the project?')) return;
    setRemoving(repoId);
    try {
      await api.delete(`/api/projects/${projectId}/repos/${repoId}`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to remove');
    } finally {
      setRemoving(null);
    }
  }

  if (loading) return <LoadingRows />;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">{repos.length} {repos.length === 1 ? 'repo' : 'repos'}</p>
        <button
          onClick={() => { setShowForm((v) => !v); setEditing(null); }}
          className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {showForm ? 'Cancel' : '+ Add repo'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <RepoForm
          form={form}
          onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
          onSubmit={handleAdd}
          submitting={submitting}
          submitLabel="Add repo"
        />
      )}

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {/* Edit form */}
      {editing && (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 space-y-3">
          <p className="text-slate-300 text-sm font-medium">Edit repo</p>
          <RepoForm
            form={editForm}
            onChange={(patch) => setEditForm((f) => ({ ...f, ...patch }))}
            onSubmit={handleUpdate}
            submitting={submitting}
            submitLabel="Save changes"
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      {repos.length === 0 ? (
        <EmptyState
          icon="🗂️"
          title="No repos linked"
          description="Link the repositories that make up this project. Claude can also add them during sessions."
          action={{ label: '+ Add repo', onClick: () => setShowForm(true) }}
        />
      ) : (
        <div className="space-y-2">
          {repos.map((repo) => (
            <div
              key={repo.id}
              className="group flex items-center gap-4 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 hover:border-slate-700 transition-all"
            >
              {/* GitHub logo */}
              <svg className="w-5 h-5 text-slate-500 shrink-0" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
              </svg>

              {/* Name + description */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-200 font-medium text-sm hover:text-brand-400 transition-colors"
                  >
                    {repo.name}
                  </a>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(repo)}
                      className="text-slate-600 hover:text-slate-300 p-0.5 rounded hover:bg-slate-800 transition-colors"
                      title="Edit"
                    >
                      <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11.5 2.5l2 2-9 9H2.5v-2l9-9z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleRemove(repo.id)}
                      disabled={removing === repo.id}
                      className="text-slate-600 hover:text-red-400 p-0.5 rounded hover:bg-slate-800 transition-colors disabled:opacity-50"
                      title="Remove"
                    >
                      <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M4 4l8 8M12 4l-8 8" />
                      </svg>
                    </button>
                  </div>
                </div>
                {repo.description && (
                  <p className="text-slate-500 text-xs mt-0.5 truncate">{repo.description}</p>
                )}
              </div>

              {/* Language — fixed width so dots stay column-aligned */}
              <div className="w-28 shrink-0 flex items-center gap-1.5">
                {repo.language ? (
                  <>
                    {langDot(repo.language)}
                    <span className="text-slate-500 text-xs truncate">{repo.language}</span>
                  </>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface RepoFormProps {
  form: CreateRepoInput;
  onChange: (patch: Partial<CreateRepoInput>) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  submitLabel: string;
  onCancel?: () => void;
}

function RepoForm({ form, onChange, onSubmit, submitting, submitLabel, onCancel }: RepoFormProps) {
  return (
    <form onSubmit={onSubmit} className="bg-slate-900 border border-slate-700 rounded-xl p-4 space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-slate-300 text-sm mb-1">Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="e.g. briefcase-api"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-slate-300 text-sm mb-1">URL *</label>
          <input
            type="url"
            value={form.url}
            onChange={(e) => onChange({ url: e.target.value })}
            placeholder="https://github.com/..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            required
          />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-slate-300 text-sm mb-1">Description</label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Short description"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-slate-300 text-sm mb-1">Language</label>
          <input
            type="text"
            value={form.language}
            onChange={(e) => onChange({ language: e.target.value })}
            placeholder="e.g. Go, TypeScript"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {submitting ? 'Saving…' : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-slate-400 hover:text-slate-200 text-sm hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function LoadingRows() {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-24 bg-slate-900 border border-slate-800 rounded-xl animate-pulse" />
      ))}
    </div>
  );
}

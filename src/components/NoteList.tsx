import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { Note, NotesResponse, NoteType } from '../types';
import { StatusBadge } from './StatusBadge';
import { EmptyState } from './EmptyState';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const NOTE_TYPES: { value: NoteType | 'all'; label: string }[] = [
  { value: 'all',     label: 'All' },
  { value: 'general', label: 'General' },
  { value: 'bug',     label: 'Bugs' },
  { value: 'idea',    label: 'Ideas' },
  { value: 'todo',    label: 'Todos' },
];

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso));
}

interface NoteListProps {
  projectId: string;
}

export function NoteList({ projectId }: NoteListProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filter, setFilter] = useState<NoteType | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState<NoteType>('general');
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const url = filter !== 'all'
        ? `/api/projects/${projectId}/notes?note_type=${filter}`
        : `/api/projects/${projectId}/notes`;
      const res = await api.get<NotesResponse>(url);
      setNotes(res.notes);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [projectId, filter]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newContent.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/api/projects/${projectId}/notes`, {
        content: newContent.trim(),
        note_type: newType,
      });
      setNewContent('');
      setShowForm(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add note');
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = filter === 'all' ? notes : notes.filter((n) => n.note_type === filter);

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex gap-1">
          {NOTE_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setFilter(t.value)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                filter === t.value
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {showForm ? 'Cancel' : '+ Add note'}
        </button>
      </div>

      {/* Add note form */}
      {showForm && (
        <form onSubmit={handleAdd} className="bg-slate-900 border border-slate-700 rounded-xl p-4 mb-4 space-y-3">
          <div>
            <label className="block text-slate-300 text-sm mb-1">Type</label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as NoteType)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="general">General</option>
              <option value="bug">Bug</option>
              <option value="idea">Idea</option>
              <option value="todo">Todo</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-300 text-sm mb-1">Content (markdown supported)</label>
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={4}
              placeholder="Write your note here…"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-y font-mono"
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {submitting ? 'Adding…' : 'Add note'}
          </button>
        </form>
      )}

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {loading ? (
        <LoadingRows />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="📝"
          title="No notes"
          description={filter !== 'all' ? `No ${filter} notes yet.` : 'Notes from Claude sessions appear here.'}
          action={{ label: '+ Add note', onClick: () => setShowForm(true) }}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((note) => (
            <div key={note.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <StatusBadge status={note.note_type} />
                <span className="text-slate-500 text-xs">{formatDate(note.created_at)}</span>
              </div>
              <div className="prose prose-sm prose-invert prose-dark max-w-none text-slate-300">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{note.content}</ReactMarkdown>
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
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-20 bg-slate-900 border border-slate-800 rounded-xl animate-pulse" />
      ))}
    </div>
  );
}

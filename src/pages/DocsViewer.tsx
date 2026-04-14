import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Layout } from '../components/Layout';
import { MermaidRenderer } from '../components/MermaidRenderer';
import { EmptyState } from '../components/EmptyState';
import { api } from '../api/client';
import type { RepoDoc } from '../types';

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso));
}

const DOC_TYPE_LABELS: Record<string, string> = {
  api_docs:     'API Documentation',
  architecture: 'Architecture',
  readme:       'README',
  custom:       'Custom Doc',
};

export function DocsViewer() {
  const { id: projectId, did } = useParams<{ id: string; did: string }>();
  const [doc, setDoc] = useState<RepoDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api.get<RepoDoc>(`/api/projects/${projectId}/docs/${did}`)
      .then((res) => setDoc(res))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [projectId, did]);

  if (loading) {
    return (
      <Layout>
        <div className="space-y-4 max-w-3xl">
          <div className="h-4 w-48 bg-slate-800 rounded animate-pulse" />
          <div className="h-8 w-80 bg-slate-800 rounded-lg animate-pulse" />
          <div className="h-96 bg-slate-900 border border-slate-800 rounded-xl animate-pulse" />
        </div>
      </Layout>
    );
  }

  if (error || !doc) {
    return (
      <Layout>
        <EmptyState icon="⚠️" title="Document not found" description={error ?? undefined} />
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
        <span className="text-slate-300">{doc.title}</span>
      </nav>

      {/* Doc header */}
      <div className="mb-6 max-w-3xl">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h1 className="text-slate-100 text-2xl font-bold">{doc.title}</h1>
          <span className="shrink-0 px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-400 text-xs rounded">
            {doc.format}
          </span>
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-slate-500">
          <span>{DOC_TYPE_LABELS[doc.doc_type] ?? doc.doc_type}</span>
          <span>Version {doc.version}</span>
          <span>Updated by {doc.updated_by}</span>
          <span>{formatDate(doc.updated_at)}</span>
        </div>
      </div>

      {/* Content */}
      {!doc.content ? (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-amber-400 text-sm max-w-3xl">
          This document is stored in Cloud Storage. Content preview is not yet available.
        </div>
      ) : doc.format === 'mermaid' ? (
        <MermaidRenderer source={doc.content} className="max-w-4xl" />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-3xl">
          <article className="prose prose-sm prose-dark max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{doc.content}</ReactMarkdown>
          </article>
        </div>
      )}
    </Layout>
  );
}

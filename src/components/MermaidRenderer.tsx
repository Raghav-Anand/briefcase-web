import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  darkMode: true,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
});

let _idCounter = 0;

interface MermaidRendererProps {
  source: string;
  className?: string;
}

export function MermaidRenderer({ source, className = '' }: MermaidRendererProps) {
  const idRef = useRef(`mermaid-${++_idCounter}`);
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      setSvg(null);
      setError(null);
      try {
        const { svg: rendered } = await mermaid.render(idRef.current, source);
        if (!cancelled) setSvg(rendered);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Render failed');
      }
    }

    render();
    return () => { cancelled = true; };
  }, [source]);

  if (error) {
    return (
      <div className={`rounded-lg bg-red-500/10 border border-red-500/30 p-4 ${className}`}>
        <p className="text-red-400 text-sm font-medium mb-1">Diagram render error</p>
        <pre className="text-red-300 text-xs overflow-auto whitespace-pre-wrap">{error}</pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className={`overflow-auto rounded-lg bg-slate-900 p-4 ${className}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

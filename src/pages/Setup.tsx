import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';

const MCP_URL = (import.meta.env.VITE_MCP_SERVER_URL as string | undefined) ?? 'https://mcp.briefcase-planner.com/mcp';

type ClientTab = 'code' | 'desktop' | 'web';

const CLIENT_TABS: { id: ClientTab; label: string }[] = [
  { id: 'code',    label: 'Claude Code' },
  { id: 'desktop', label: 'Claude Desktop' },
  { id: 'web',     label: 'claude.ai' },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium transition-colors"
    >
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
          </svg>
          <span className="text-emerald-400">Copied!</span>
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 17 6.622V12.5a1.5 1.5 0 0 1-1.5 1.5h-1v-3.379a3 3 0 0 0-.879-2.121L10.5 5.379A3 3 0 0 0 8.379 4.5H7v-1Z" />
            <path d="M4.5 6A1.5 1.5 0 0 0 3 7.5v9A1.5 1.5 0 0 0 4.5 18h7a1.5 1.5 0 0 0 1.5-1.5v-5.879a1.5 1.5 0 0 0-.44-1.06L9.44 6.439A1.5 1.5 0 0 0 8.378 6H4.5Z" />
          </svg>
          Copy
        </>
      )}
    </button>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="group relative bg-slate-950 border border-slate-800 rounded-lg">
      <div className="absolute top-2.5 right-2.5">
        <CopyButton text={code} />
      </div>
      <pre className="text-sm text-slate-300 font-mono overflow-x-auto p-4 pr-20">
        <code>{code}</code>
      </pre>
    </div>
  );
}

const INSTRUCTIONS: Record<ClientTab, React.ReactNode> = {
  code: (
    <div className="space-y-4">
      <p className="text-slate-300 text-sm">Run this command in your terminal:</p>
      <CodeBlock code={`claude mcp add --transport http briefcase ${MCP_URL}`} />
      <p className="text-slate-400 text-sm">
        That's it. The next time you run{' '}
        <code className="text-brand-400 bg-slate-800 px-1.5 py-0.5 rounded text-xs">claude</code>, Briefcase will
        be available as a connected MCP server.
      </p>
    </div>
  ),
  desktop: (
    <div className="space-y-4">
      <ol className="space-y-3 text-sm text-slate-300">
        <li className="flex gap-3">
          <span className="w-5 h-5 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
          Open <strong>Claude Desktop</strong> → Settings → Connectors
        </li>
        <li className="flex gap-3">
          <span className="w-5 h-5 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
          Click <strong>Add custom connector</strong>
        </li>
        <li className="flex gap-3">
          <span className="w-5 h-5 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
          Paste the connector URL:
        </li>
      </ol>
      <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 font-mono text-sm text-slate-300">
        <span className="flex-1 overflow-x-auto">{MCP_URL}</span>
        <CopyButton text={MCP_URL} />
      </div>
      <li className="flex gap-3 list-none text-sm text-slate-300">
        <span className="w-5 h-5 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">4</span>
        Click <strong>Save</strong> and restart Claude Desktop if prompted.
      </li>
    </div>
  ),
  web: (
    <div className="space-y-4">
      <ol className="space-y-3 text-sm text-slate-300">
        <li className="flex gap-3">
          <span className="w-5 h-5 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
          Open <strong>claude.ai</strong> → Settings → Integrations
        </li>
        <li className="flex gap-3">
          <span className="w-5 h-5 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
          Click <strong>Add custom connector</strong>
        </li>
        <li className="flex gap-3">
          <span className="w-5 h-5 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
          Paste the connector URL:
        </li>
      </ol>
      <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 font-mono text-sm text-slate-300">
        <span className="flex-1 overflow-x-auto">{MCP_URL}</span>
        <CopyButton text={MCP_URL} />
      </div>
      <li className="flex gap-3 list-none text-sm text-slate-300">
        <span className="w-5 h-5 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">4</span>
        Click <strong>Add</strong>.
      </li>
    </div>
  ),
};

export function Setup() {
  const [activeClient, setActiveClient] = useState<ClientTab>('code');

  return (
    <Layout>
      <div className="max-w-2xl">
        <div className="mb-8">
          <h1 className="text-slate-100 text-2xl font-bold mb-2">Connect Claude to Briefcase</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Add the Briefcase MCP connector to your Claude client. This is a one-time setup — after
            that, every Claude session automatically loads your project context.
          </p>
        </div>

        {/* Client tabs */}
        <div className="border-b border-slate-800 mb-6">
          <div className="flex gap-1 -mb-px">
            {CLIENT_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveClient(tab.id)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeClient === tab.id
                    ? 'border-brand-500 text-brand-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-8 animate-fade-in">
          {INSTRUCTIONS[activeClient]}
        </div>

        {/* What happens next */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6">
          <h2 className="text-slate-200 font-medium mb-3">What happens next</h2>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="flex gap-2">
              <span className="text-brand-400 shrink-0">→</span>
              The first time Claude uses Briefcase, it will open a Google sign-in popup.
            </li>
            <li className="flex gap-2">
              <span className="text-brand-400 shrink-0">→</span>
              After sign-in, the connector loads automatically on every future session — no action needed.
            </li>
            <li className="flex gap-2">
              <span className="text-brand-400 shrink-0">→</span>
              Tell Claude: <em>"Let's work on my project"</em> and it will call{' '}
              <code className="text-brand-400 bg-slate-800 px-1.5 py-0.5 rounded text-xs">start_session</code>{' '}
              automatically to load context.
            </li>
          </ul>
        </div>

        {/* Security note */}
        <div className="bg-brand-500/5 border border-brand-500/20 rounded-xl p-4 mb-8 text-sm text-slate-400">
          <p>
            <strong className="text-slate-300">Security note:</strong> The Google sign-in authenticates
            you with Briefcase, not with Google's services. We request only{' '}
            <code className="text-brand-400 bg-slate-800 px-1 py-0.5 rounded text-xs">openid</code>,{' '}
            <code className="text-brand-400 bg-slate-800 px-1 py-0.5 rounded text-xs">email</code>, and{' '}
            <code className="text-brand-400 bg-slate-800 px-1 py-0.5 rounded text-xs">profile</code>{' '}
            scopes — we cannot access your Gmail, Drive, or any other Google data.
          </p>
        </div>

        <div className="text-xs text-slate-500 flex gap-4">
          <Link to="/privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-slate-400 transition-colors">Terms of Service</Link>
        </div>
      </div>
    </Layout>
  );
}

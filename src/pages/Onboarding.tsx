import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';

const MCP_URL = (import.meta.env.VITE_MCP_SERVER_URL as string | undefined) ?? 'https://mcp.briefcase-planner.com/mcp';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium transition-colors"
    >
      {copied ? <span className="text-emerald-400">Copied!</span> : 'Copy'}
    </button>
  );
}

export function Onboarding() {
  return (
    <Layout>
      <div className="max-w-2xl">
        <div className="mb-8">
          <h1 className="text-slate-100 text-2xl font-bold mb-2">Get started with Briefcase</h1>
          <p className="text-slate-400 text-sm">
            Three steps to never lose session context again.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-6 mb-10">
          {/* Step 1 */}
          <div className="flex gap-5">
            <div className="flex flex-col items-center">
              <span className="w-8 h-8 rounded-full bg-brand-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
                1
              </span>
              <div className="w-px flex-1 bg-slate-800 mt-2 mb-0" />
            </div>
            <div className="flex-1 pb-6">
              <h3 className="text-slate-100 font-semibold mb-1">Sign in</h3>
              <p className="text-slate-400 text-sm mb-3">
                Create your Briefcase account by signing in with Google. This links your Claude
                sessions to your account.
              </p>
              <Link
                to="/"
                className="inline-flex px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Sign in with Google →
              </Link>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-5">
            <div className="flex flex-col items-center">
              <span className="w-8 h-8 rounded-full bg-brand-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
                2
              </span>
              <div className="w-px flex-1 bg-slate-800 mt-2" />
            </div>
            <div className="flex-1 pb-6">
              <h3 className="text-slate-100 font-semibold mb-1">Add the MCP connector</h3>
              <p className="text-slate-400 text-sm mb-3">
                Paste this URL into your Claude client's connector settings. See the{' '}
                <Link to="/setup" className="text-brand-400 hover:text-brand-300 transition-colors">
                  setup page
                </Link>{' '}
                for per-client instructions.
              </p>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 font-mono text-sm text-slate-300">
                <span className="flex-1 overflow-x-auto text-xs sm:text-sm">{MCP_URL}</span>
                <CopyButton text={MCP_URL} />
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-5">
            <div className="flex flex-col items-center">
              <span className="w-8 h-8 rounded-full bg-brand-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
                3
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-slate-100 font-semibold mb-1">Start a Claude session</h3>
              <p className="text-slate-400 text-sm mb-3">
                Open Claude and say <em>"Let's work on my project."</em> Claude will call{' '}
                <code className="text-brand-400 bg-slate-800 px-1.5 py-0.5 rounded text-xs">start_session</code>{' '}
                automatically. On first use, a Google sign-in popup will appear — after that it's
                seamless.
              </p>
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-slate-400 font-mono">
                "Let's work on my project. Please start the session."
              </div>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="border-t border-slate-800 pt-5 text-xs text-slate-500 flex gap-4">
          <Link to="/setup" className="hover:text-slate-400 transition-colors">Detailed setup →</Link>
          <Link to="/privacy" className="hover:text-slate-400 transition-colors">Privacy policy</Link>
          <Link to="/terms" className="hover:text-slate-400 transition-colors">Terms of service</Link>
        </div>
      </div>
    </Layout>
  );
}

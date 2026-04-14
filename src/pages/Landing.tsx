import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../auth/useAuth';
import { Layout } from '../components/Layout';

const FEATURES = [
  {
    icon: '🔄',
    title: 'Automatic context restore',
    desc: 'Every session starts with a full summary of where you left off — decisions made, milestones open, what to do next.',
  },
  {
    icon: '📋',
    title: 'Timeline & history',
    desc: 'Browse every past session, see what Claude did, and trace decisions back to the conversation that made them.',
  },
  {
    icon: '📐',
    title: 'Docs & diagrams',
    desc: 'Claude uploads architecture docs and Mermaid diagrams that evolve session-over-session. Read them anytime.',
  },
];

export function Landing() {
  const { user, onGoogleSuccess } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  return (
    <Layout>
      {/* Hero */}
      <section className="text-center pt-14 pb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-medium mb-7">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
          MCP-powered · Zero config · Free tier
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-slate-100 leading-tight mb-4">
          Every Claude session,{' '}
          <span className="text-brand-400">remembered.</span>
        </h1>

        <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed mb-10">
          Briefcase connects to Claude via MCP and automatically saves your project
          context between sessions. No copy-pasting. No re-explaining.
        </p>

        {/* Sign-in card */}
        <div id="signin" className="inline-flex flex-col items-center gap-4 bg-slate-900 border border-slate-700 rounded-2xl px-8 py-6 shadow-xl shadow-slate-950/50">
          <p className="text-slate-300 text-sm font-medium">Sign in to get started</p>
          <GoogleLogin
            onSuccess={(res) => {
              if (res.credential) onGoogleSuccess(res.credential);
            }}
            onError={() => console.error('Google sign-in failed')}
            theme="filled_black"
            size="large"
            text="signin_with"
            shape="rectangular"
            auto_select
          />
          <p className="text-slate-500 text-xs max-w-xs text-center leading-relaxed">
            Authenticates you with Briefcase — we don't access your Google account data.
          </p>
        </div>
      </section>

      {/* Feature cards */}
      <section className="grid sm:grid-cols-3 gap-4 mb-16">
        {FEATURES.map((f) => (
          <div key={f.title} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <span className="text-2xl mb-3 block">{f.icon}</span>
            <h3 className="text-slate-100 font-semibold mb-2">{f.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 mb-16">
        <h2 className="text-slate-100 font-semibold text-lg mb-6">How it works</h2>
        <ol className="space-y-4">
          {[
            ['Add the MCP connector', 'Paste the Briefcase URL into Claude Desktop, Claude Code, or claude.ai. One-time setup.'],
            ['Sign in with Google', 'Claude opens a Google OAuth popup on first use. After that it loads automatically.'],
            ['Work normally with Claude', 'Say "let\'s work on my project." Claude calls start_session and gets full context automatically.'],
            ['Context is saved', 'When the session ends, Claude calls end_session and everything is persisted for next time.'],
          ].map(([step, detail], i) => (
            <li key={step} className="flex gap-4">
              <span className="w-7 h-7 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-400 text-sm font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <div>
                <p className="text-slate-200 font-medium text-sm">{step}</p>
                <p className="text-slate-400 text-sm">{detail}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-6 pt-5 border-t border-slate-800">
          <a
            href="/setup"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            View setup instructions →
          </a>
        </div>
      </section>
    </Layout>
  );
}

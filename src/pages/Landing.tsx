import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../auth/useAuth';
import { Layout } from '../components/Layout';

export function Landing() {
  const { user, onGoogleSuccess } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)] text-center animate-fade-in">
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.1] mb-5 text-slate-100">
          Claude forgets.<br />
          <span className="text-brand-400">Briefcase</span> doesn't.
        </h1>

        <p className="text-slate-400 text-base sm:text-lg max-w-sm leading-relaxed mb-10">
          An MCP server that saves your project context between Claude sessions — decisions, milestones, docs — and restores it automatically next time.
        </p>

        <div id="signin" className="flex flex-col items-center gap-3">
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
          <p className="text-slate-600 text-xs">
            We don't access your Google account data.
          </p>
        </div>
      </div>
    </Layout>
  );
}

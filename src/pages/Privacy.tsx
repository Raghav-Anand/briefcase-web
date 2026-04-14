import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';

const EFFECTIVE_DATE = 'April 9, 2026';

export function Privacy() {
  return (
    <Layout>
      <div className="max-w-2xl">
        <div className="mb-8">
          <h1 className="text-slate-100 text-2xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-slate-500 text-sm">Effective date: {EFFECTIVE_DATE}</p>
        </div>

        <div className="prose prose-sm prose-dark max-w-none space-y-6 text-slate-300">
          <Section title="1. What we collect">
            <p>When you sign in with Google, we receive your Google account email address, display name,
            and profile photo URL. We store these to identify your account.</p>
            <p>We store the project data you create and the session data that Claude writes on your
            behalf via the MCP server: project names, descriptions, session summaries, decisions,
            milestones, notes, and documents.</p>
            <p>We do <strong>not</strong> collect your browsing history, location, contacts, or any
            data beyond what is described here.</p>
          </Section>

          <Section title="2. How we use your data">
            <ul>
              <li>To authenticate you and identify your data.</li>
              <li>To display your projects and session history in the web dashboard.</li>
              <li>To provide context to Claude via the MCP server during sessions you initiate.</li>
            </ul>
            <p>We do not sell, rent, or share your data with third parties for advertising or
            any purpose other than operating the service.</p>
          </Section>

          <Section title="3. Google OAuth">
            <p>We use Google Sign-In for authentication. We request the following OAuth scopes:</p>
            <ul>
              <li><code>openid</code> — standard OIDC identity token</li>
              <li><code>email</code> — your email address</li>
              <li><code>profile</code> — your name and profile photo</li>
            </ul>
            <p>We do not request access to Gmail, Google Drive, Google Calendar, or any other
            Google service. The Google ID token is used only to verify your identity with our backend;
            we cannot access your Google account data.</p>
          </Section>

          <Section title="4. Data storage">
            <p>Your data is stored in Google Firestore and Google Cloud Storage in the
            <code>us-central1</code> region. We use Google Cloud Platform's built-in security
            controls. All data is encrypted at rest and in transit.</p>
          </Section>

          <Section title="5. Data retention and deletion">
            <p>You may request deletion of your account and all associated data by emailing us
            at <a href="mailto:privacy@briefcase-planner.com" className="text-brand-400">privacy@briefcase-planner.com</a>.
            We will process deletion requests within 30 days.</p>
          </Section>

          <Section title="6. Cookies">
            <p>We do not use cookies. Authentication state is stored in browser sessionStorage and
            expires when you close the tab or the Google ID token expires (typically 1 hour).</p>
          </Section>

          <Section title="7. Changes to this policy">
            <p>We may update this policy. Material changes will be reflected by an updated
            effective date. Continued use of the service constitutes acceptance of the revised policy.</p>
          </Section>

          <Section title="8. Contact">
            <p>Questions? Email us at{' '}
              <a href="mailto:privacy@briefcase-planner.com" className="text-brand-400">
                privacy@briefcase-planner.com
              </a>.
            </p>
          </Section>
        </div>

        <div className="mt-8 pt-5 border-t border-slate-800 text-xs text-slate-500 flex gap-4">
          <Link to="/terms" className="hover:text-slate-400 transition-colors">Terms of Service</Link>
          <Link to="/" className="hover:text-slate-400 transition-colors">Home</Link>
        </div>
      </div>
    </Layout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-slate-200 font-semibold text-base mb-2">{title}</h2>
      <div className="text-slate-400 text-sm leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';

const EFFECTIVE_DATE = 'April 9, 2026';

export function Terms() {
  return (
    <Layout>
      <div className="max-w-2xl">
        <div className="mb-8">
          <h1 className="text-slate-100 text-2xl font-bold mb-2">Terms of Service</h1>
          <p className="text-slate-500 text-sm">Effective date: {EFFECTIVE_DATE}</p>
        </div>

        <div className="space-y-6 text-sm text-slate-400 leading-relaxed">
          <Section title="1. Acceptance">
            <p>By using Briefcase ("the Service"), you agree to these Terms. If you disagree,
            do not use the Service.</p>
          </Section>

          <Section title="2. Description of service">
            <p>Briefcase is a project context persistence tool. It connects to Claude AI clients
            via the Model Context Protocol (MCP), saves session summaries, decisions, milestones,
            and notes, and restores this context at the start of each new session.</p>
          </Section>

          <Section title="3. Your account">
            <p>You must sign in with a valid Google account to use the Service. You are responsible
            for all activity that occurs under your account. You may not share your account with
            others or use the Service to store data on behalf of other users.</p>
          </Section>

          <Section title="4. Acceptable use">
            <p>You agree not to:</p>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to reverse-engineer, scrape, or overload the API</li>
              <li>Store sensitive personal information such as passwords, financial data, or health records</li>
              <li>Circumvent rate limits or authentication mechanisms</li>
            </ul>
          </Section>

          <Section title="5. Intellectual property">
            <p>You retain ownership of all content you store in the Service (project descriptions,
            notes, documents, etc.). You grant Briefcase a limited license to store and serve this
            content to you and to Claude on your behalf.</p>
            <p>The Briefcase name, logo, and codebase are owned by the service operator.</p>
          </Section>

          <Section title="6. Availability">
            <p>The Service is provided "as is" without uptime guarantees. We may modify, suspend,
            or discontinue the Service at any time. We will make reasonable efforts to provide
            advance notice of major changes.</p>
          </Section>

          <Section title="7. Disclaimer of warranties">
            <p>THE SERVICE IS PROVIDED WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT
            GUARANTEE THAT THE SERVICE WILL BE ERROR-FREE, UNINTERRUPTED, OR THAT YOUR DATA WILL
            NEVER BE LOST. YOU USE THE SERVICE AT YOUR OWN RISK.</p>
          </Section>

          <Section title="8. Limitation of liability">
            <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT,
            INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING FROM YOUR USE OF THE SERVICE,
            EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.</p>
          </Section>

          <Section title="9. Changes to terms">
            <p>We may update these Terms. Material changes will be reflected by an updated effective
            date. Continued use of the Service constitutes acceptance of the revised Terms.</p>
          </Section>

          <Section title="10. Contact">
            <p>Questions? Email{' '}
              <a href="mailto:legal@briefcase-planner.com" className="text-brand-400">
                legal@briefcase-planner.com
              </a>.
            </p>
          </Section>
        </div>

        <div className="mt-8 pt-5 border-t border-slate-800 text-xs text-slate-500 flex gap-4">
          <Link to="/privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
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
      <div className="space-y-2">{children}</div>
    </section>
  );
}

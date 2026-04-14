import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import { ProtectedRoute } from './auth/ProtectedRoute';

// Pages
import { Landing }       from './pages/Landing';
import { Dashboard }     from './pages/Dashboard';
import { ProjectDetail } from './pages/ProjectDetail';
import { SessionDetail } from './pages/SessionDetail';
import { DocsViewer }    from './pages/DocsViewer';
import { Onboarding }    from './pages/Onboarding';
import { Setup }         from './pages/Setup';
import { Privacy }       from './pages/Privacy';
import { Terms }         from './pages/Terms';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/"            element={<Landing />} />
          <Route path="/onboarding"  element={<Onboarding />} />
          <Route path="/setup"       element={<Setup />} />
          <Route path="/privacy"     element={<Privacy />} />
          <Route path="/terms"       element={<Terms />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard"                              element={<Dashboard />} />
            <Route path="/projects/:id"                           element={<ProjectDetail />} />
            <Route path="/projects/:id/sessions/:sid"             element={<SessionDetail />} />
            <Route path="/projects/:id/docs/:did"                 element={<DocsViewer />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Landing />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

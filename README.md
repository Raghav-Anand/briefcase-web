# briefcase-web

React SPA for [Briefcase](https://briefcase-planner.com) — a project progress tracker for agentic coding sessions. Provides a dashboard for viewing project timelines, session history, decisions, milestones, docs, and architecture diagrams. Also the onboarding entry point for new users.

## Architecture

```
User (browser)
      │  HTTPS
      ▼
briefcase-web  (this repo, Firebase Hosting)
      │  REST / Google ID token
      ▼
briefcase-api  (Cloud Run, Go)
      │
      ▼
Firestore / Cloud Storage
```

Authentication uses Google Identity Services (GIS). The `GoogleLogin` component returns a signed Google ID token (JWT), which is attached to every API request as `Authorization: Bearer <token>`. The API server validates it via Google's JWKS — no session cookies, no Firebase Auth SDK.

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 20+ | `brew install node` or [nodejs.org](https://nodejs.org) |
| npm | 10+ | bundled with Node |

---

## Running Locally

### 1. Clone and install

```bash
git clone https://github.com/Raghav-Anand/briefcase-web
cd briefcase-web
npm install
```

### 2. Configure environment

Copy the example env file and fill in your values:

```bash
cp .env.local.example .env.local   # or create .env.local manually
```

`.env.local`:
```
VITE_API_URL=https://api.briefcase-planner.com
VITE_OAUTH_CLIENT_ID=559122832944-t5f6vm1a5sq70j642e1mfd4ntpt424bu.apps.googleusercontent.com
VITE_MCP_SERVER_URL=https://mcp.briefcase-planner.com/mcp
```

To point at a local API server instead:

```bash
VITE_API_URL=http://localhost:8080 npm run dev
```

### 3. Start the dev server

```bash
npm run dev
# → http://localhost:5173
```

Vite hot-reloads on every save. The dev server proxies nothing — all API calls go directly to `VITE_API_URL`.

### 4. Build and preview the production bundle

```bash
npm run build    # outputs to dist/
npm run preview  # serves dist/ on http://localhost:4173
```

---

## Running Tests

### All tests (single run)

```bash
npm run test:run
```

### Watch mode (during development)

```bash
npm test
```

### With coverage report

```bash
npm run coverage
# → coverage/ directory with HTML report
```

### Expected output

```
 Test Files  7 passed (7)
      Tests  47 passed (47)
```

---

## Test Structure

Tests live alongside the source files they cover.

```
src/
├── api/
│   └── client.test.ts          ← auth header injection, ApiError, POST/PATCH bodies
├── auth/
│   └── ProtectedRoute.test.tsx ← redirect when unauthenticated, spinner while loading
├── components/
│   ├── StatusBadge.test.tsx    ← correct label + styles for all status values
│   ├── EmptyState.test.tsx     ← title, description, action button callback
│   └── ProjectCard.test.tsx    ← renders project fields, links, badge, tech stack truncation
└── hooks/
    ├── useProjects.test.ts     ← fetch on mount, archived flag, error state, create()
    └── useSessions.test.ts     ← pagination, loadMore, cursor passthrough, error state
```

The API client is mocked in hook tests — no real network requests are made.

### What is and isn't tested

| Covered by unit tests | Requires manual / E2E |
|-----------------------|----------------------|
| API client auth header and error handling | Google OAuth popup flow |
| Route protection (authenticated vs. not) | Mermaid diagram rendering |
| All status badge variants | react-markdown rendering |
| Project card rendering + linking | Full dashboard with live API |
| `useProjects` / `useSessions` hook lifecycle | Firebase Hosting deploy |

---

## Project Structure

```
briefcase-web/
├── src/
│   ├── main.tsx               ← entry point
│   ├── App.tsx                ← router + auth provider
│   ├── api/
│   │   └── client.ts          ← fetch wrapper, auto-attaches Google ID token
│   ├── auth/
│   │   ├── AuthProvider.tsx   ← Google OAuth context, sessionStorage persistence
│   │   ├── useAuth.ts         ← hook: { user, idToken, loading, onGoogleSuccess, signOut }
│   │   └── ProtectedRoute.tsx ← redirects to / when unauthenticated
│   ├── components/
│   │   ├── Layout.tsx         ← nav bar + footer shell
│   │   ├── ProjectCard.tsx    ← card with name, status, last session, tech stack
│   │   ├── SessionTimeline.tsx← chronological session list with links
│   │   ├── MilestoneList.tsx  ← milestone CRUD (create, complete)
│   │   ├── DecisionLog.tsx    ← read-only decision list with rationale
│   │   ├── NoteList.tsx       ← note list with type filter + add from web
│   │   ├── MermaidRenderer.tsx← renders Mermaid source to SVG client-side
│   │   ├── StatusBadge.tsx    ← colored pill for all status/type values
│   │   └── EmptyState.tsx     ← empty list placeholder with optional CTA
│   ├── hooks/
│   │   ├── useProjects.ts     ← project list + create
│   │   ├── useProject.ts      ← single project + update + archive
│   │   └── useSessions.ts     ← cursor-paginated session list
│   ├── pages/
│   │   ├── Landing.tsx        ← public hero + Google sign-in CTA
│   │   ├── Dashboard.tsx      ← project grid + "New project" modal
│   │   ├── ProjectDetail.tsx  ← 6-tab view: overview, sessions, milestones, decisions, notes, docs
│   │   ├── SessionDetail.tsx  ← session summary, next steps, tool call log
│   │   ├── DocsViewer.tsx     ← markdown or Mermaid doc renderer
│   │   ├── Setup.tsx          ← MCP connector setup (per-client tabs)
│   │   ├── Onboarding.tsx     ← step-by-step onboarding flow
│   │   ├── Privacy.tsx        ← privacy policy (required for OAuth verification)
│   │   └── Terms.tsx          ← terms of service
│   ├── types/
│   │   └── index.ts           ← TypeScript types mirroring API response shapes
│   └── test/
│       └── setup.ts           ← jest-dom matchers, mermaid mock, clipboard stub
├── public/
│   └── favicon.svg
├── tailwind.config.js         ← theme tokens (brand color palette — change here to retheme)
├── vite.config.ts             ← Vite + Vitest config
├── firebase.json              ← Firebase Hosting config (SPA rewrite rules)
└── .github/
    └── workflows/
        └── deploy.yml         ← build + firebase deploy on push to main
```

---

## Deployment

Push to `main` — GitHub Actions handles the rest:

1. Runs `npm ci && npm run build`
2. Deploys `dist/` to Firebase Hosting via `FirebaseExtended/action-hosting-deploy`

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `VITE_API_URL` | API server base URL, e.g. `https://api.briefcase-planner.com` |
| `VITE_OAUTH_CLIENT_ID` | Google OAuth client ID |
| `VITE_MCP_SERVER_URL` | MCP server URL for setup instructions, e.g. `https://mcp.briefcase-planner.com/mcp` |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase service account JSON (from Firebase Console → Project Settings → Service Accounts) |
| `FIREBASE_PROJECT_ID` | Firebase project ID, e.g. `briefcase-planner` |

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | **Yes** | Base URL for briefcase-api, e.g. `https://api.briefcase-planner.com` |
| `VITE_OAUTH_CLIENT_ID` | **Yes** | Google OAuth client ID for `GoogleOAuthProvider` |
| `VITE_MCP_SERVER_URL` | No | Shown on Setup and Onboarding pages. Defaults to `https://mcp.briefcase-planner.com/mcp` |

All variables must be prefixed with `VITE_` to be exposed to the browser bundle. Never put secrets in environment variables — only public configuration.

---

## Theming

The brand color palette is defined in `tailwind.config.js` under `theme.extend.colors.brand`. Swap the hex values to retheme the entire app:

```js
// tailwind.config.js
colors: {
  brand: {
    500: '#6366f1',  // ← change this (currently indigo)
    600: '#4f46e5',
    // ...
  },
},
```

All accent colors in components reference `brand-*` tokens. Background and text use standard Tailwind `slate-*` values.

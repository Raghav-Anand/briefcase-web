// API client — thin fetch wrapper that auto-attaches the Google ID token.
// The token is set via setAuthToken() from AuthProvider whenever auth state changes.

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? 'https://api.briefcase-planner.com';

declare global {
  interface Window {
    google?: { accounts: { id: { prompt: () => void } } };
  }
}

let _authToken: string | null = null;
// Resolvers waiting for a refreshed token after a 401
let _refreshPromise: Promise<string | null> | null = null;

/** Called by AuthProvider whenever the ID token changes. */
export function setAuthToken(token: string | null): void {
  _authToken = token;
  if (token && _refreshResolve) {
    _refreshResolve(token);
    _refreshResolve = null;
    _refreshPromise = null;
  }
}

let _refreshResolve: ((token: string | null) => void) | null = null;

/**
 * Trigger a silent Google One Tap re-auth and wait for the new token.
 * Resolves with the new token, or null if re-auth doesn't complete within 30s.
 */
function refreshToken(): Promise<string | null> {
  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = new Promise<string | null>((resolve) => {
    _refreshResolve = resolve;
    // Ask Google to silently re-issue a credential
    window.google?.accounts.id.prompt();
    // Timeout after 30s — don't hang requests forever
    setTimeout(() => {
      if (_refreshResolve) {
        _refreshResolve(null);
        _refreshResolve = null;
        _refreshPromise = null;
      }
    }, 30_000);
  });

  return _refreshPromise;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiFetch<T>(path: string, options?: RequestInit, retry = true): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> | undefined),
  };

  if (_authToken) {
    headers['Authorization'] = `Bearer ${_authToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  // On 401, attempt a silent token refresh then retry once
  if (res.status === 401 && retry) {
    const newToken = await refreshToken();
    if (newToken) {
      return apiFetch<T>(path, options, false);
    }
    // Re-auth failed — fall through to throw below
  }

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      // ignore parse errors
    }
    throw new ApiError(res.status, message);
  }

  // Handle 204 No Content
  if (res.status === 204) return undefined as unknown as T;

  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string): Promise<T> => apiFetch<T>(path),

  post: <T>(path: string, body?: unknown): Promise<T> =>
    apiFetch<T>(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined }),

  patch: <T>(path: string, body: unknown): Promise<T> =>
    apiFetch<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),

  delete: <T>(path: string): Promise<T> =>
    apiFetch<T>(path, { method: 'DELETE' }),
};

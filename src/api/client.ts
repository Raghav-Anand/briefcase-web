// API client — thin fetch wrapper that auto-attaches the Google ID token.
// The token is set via setAuthToken() from AuthProvider whenever auth state changes.

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? 'https://api.briefcase-planner.com';

let _authToken: string | null = null;

/** Called by AuthProvider whenever the ID token changes. */
export function setAuthToken(token: string | null): void {
  _authToken = token;
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

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> | undefined),
  };

  if (_authToken) {
    headers['Authorization'] = `Bearer ${_authToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

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

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api, ApiError, setAuthToken } from './client';

describe('api client', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    setAuthToken(null);
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  function mockFetch(body: unknown, status = 200) {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(body),
    } as Response);
  }

  it('attaches Authorization header when token is set', async () => {
    mockFetch({ projects: [] });
    setAuthToken('my-token');
    await api.get('/api/projects');

    const [, opts] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    expect((opts.headers as Record<string, string>)['Authorization']).toBe('Bearer my-token');
  });

  it('does not attach Authorization header when no token', async () => {
    mockFetch({ projects: [] });
    await api.get('/api/projects');

    const [, opts] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    expect((opts.headers as Record<string, string>)['Authorization']).toBeUndefined();
  });

  it('uses the correct base URL and path', async () => {
    mockFetch({});
    await api.get('/api/me');

    const [url] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string];
    expect(url).toContain('/api/me');
  });

  it('throws ApiError with message from response body on non-ok', async () => {
    mockFetch({ error: 'Project not found' }, 404);
    await expect(api.get('/api/projects/bad')).rejects.toThrow('Project not found');
  });

  it('throws ApiError with status code on non-ok', async () => {
    mockFetch({ error: 'Unauthorized' }, 401);
    try {
      await api.get('/api/projects');
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      expect((e as ApiError).status).toBe(401);
    }
  });

  it('sends POST body as JSON', async () => {
    mockFetch({ id: 'new-id', message: 'created' });
    await api.post('/api/projects', { name: 'My Project' });

    const [, opts] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    expect(opts.method).toBe('POST');
    expect(opts.body).toBe(JSON.stringify({ name: 'My Project' }));
  });

  it('sends PATCH body as JSON', async () => {
    mockFetch({});
    await api.patch('/api/projects/abc', { status: 'paused' });

    const [, opts] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    expect(opts.method).toBe('PATCH');
    expect(opts.body).toBe(JSON.stringify({ status: 'paused' }));
  });
});

import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useSessions } from './useSessions';
import type { SessionsResponse } from '../types';

vi.mock('../api/client', () => ({
  api: { get: vi.fn() },
  setAuthToken: vi.fn(),
}));

const { api } = await import('../api/client');

const SESSION_PAGE_1: SessionsResponse = {
  sessions: [
    {
      id: 's1', status: 'completed', started_at: '2026-01-10T10:00:00Z',
      ended_at: '2026-01-10T11:00:00Z', tool_call_count: 5,
      client_type: 'claude_code', auto_closed: false, created_at: '2026-01-10T10:00:00Z',
    },
  ],
  has_more: true,
  next_cursor: 'cursor-abc',
};

const SESSION_PAGE_2: SessionsResponse = {
  sessions: [
    {
      id: 's2', status: 'completed', started_at: '2026-01-09T10:00:00Z',
      ended_at: '2026-01-09T11:00:00Z', tool_call_count: 3,
      client_type: 'claude_desktop', auto_closed: false, created_at: '2026-01-09T10:00:00Z',
    },
  ],
  has_more: false,
};

describe('useSessions', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockResolvedValue(SESSION_PAGE_1);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('fetches sessions on mount', async () => {
    const { result } = renderHook(() => useSessions('proj-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.sessions).toHaveLength(1);
    expect(result.current.sessions[0].id).toBe('s1');
  });

  it('reflects hasMore from response', async () => {
    const { result } = renderHook(() => useSessions('proj-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.hasMore).toBe(true);
  });

  it('loadMore appends next page', async () => {
    vi.mocked(api.get)
      .mockResolvedValueOnce(SESSION_PAGE_1)
      .mockResolvedValueOnce(SESSION_PAGE_2);

    const { result } = renderHook(() => useSessions('proj-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.sessions).toHaveLength(2);
    expect(result.current.sessions[1].id).toBe('s2');
    expect(result.current.hasMore).toBe(false);
  });

  it('passes cursor in loadMore request', async () => {
    vi.mocked(api.get)
      .mockResolvedValueOnce(SESSION_PAGE_1)
      .mockResolvedValueOnce(SESSION_PAGE_2);

    const { result } = renderHook(() => useSessions('proj-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(() => result.current.loadMore());

    expect(api.get).toHaveBeenLastCalledWith(
      expect.stringContaining('before=cursor-abc'),
    );
  });

  it('sets error when fetch fails', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('Server error'));
    const { result } = renderHook(() => useSessions('proj-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Server error');
  });
});

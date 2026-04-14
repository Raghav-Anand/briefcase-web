import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import type { Session, SessionsResponse } from '../types';

interface UseSessionsResult {
  sessions: Session[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useSessions(projectId: string, limit = 20): UseSessionsResult {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSessions([]);
    setNextCursor(undefined);
    try {
      const res = await api.get<SessionsResponse>(
        `/api/projects/${projectId}/sessions?limit=${limit}`,
      );
      setSessions(res.sessions);
      setHasMore(res.has_more);
      setNextCursor(res.next_cursor);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }, [projectId, limit]);

  useEffect(() => { refresh(); }, [refresh]);

  const loadMore = useCallback(async () => {
    if (!hasMore || !nextCursor) return;
    setLoading(true);
    try {
      const res = await api.get<SessionsResponse>(
        `/api/projects/${projectId}/sessions?limit=${limit}&before=${nextCursor}`,
      );
      setSessions((prev) => [...prev, ...res.sessions]);
      setHasMore(res.has_more);
      setNextCursor(res.next_cursor);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load more');
    } finally {
      setLoading(false);
    }
  }, [projectId, limit, hasMore, nextCursor]);

  return { sessions, loading, error, hasMore, loadMore, refresh };
}

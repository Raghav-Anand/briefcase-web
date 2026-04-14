import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import type { Project, UpdateProjectInput } from '../types';

interface UseProjectResult {
  project: Project | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  update: (input: UpdateProjectInput) => Promise<void>;
  archive: () => Promise<void>;
}

export function useProject(projectId: string): UseProjectResult {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<Project>(`/api/projects/${projectId}`);
      setProject(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load project');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { refresh(); }, [refresh]);

  const update = useCallback(async (input: UpdateProjectInput) => {
    await api.patch(`/api/projects/${projectId}`, input);
    await refresh();
  }, [projectId, refresh]);

  const archive = useCallback(async () => {
    await api.post(`/api/projects/${projectId}/archive`, {});
    await refresh();
  }, [projectId, refresh]);

  return { project, loading, error, refresh, update, archive };
}

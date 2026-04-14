import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import type { Project, ProjectsResponse, CreateProjectInput } from '../types';

interface UseProjectsResult {
  projects: Project[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  create: (input: CreateProjectInput) => Promise<string>; // returns new project id
}

export function useProjects(includeArchived = false): UseProjectsResult {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = includeArchived
        ? '/api/projects?include_archived=true'
        : '/api/projects';
      const res = await api.get<ProjectsResponse>(url);
      setProjects(res.projects);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [includeArchived]);

  useEffect(() => { refresh(); }, [refresh]);

  const create = useCallback(async (input: CreateProjectInput): Promise<string> => {
    const res = await api.post<{ id: string; message: string }>('/api/projects', input);
    await refresh();
    return res.id;
  }, [refresh]);

  return { projects, loading, error, refresh, create };
}

import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useProjects } from './useProjects';
import type { ProjectsResponse } from '../types';

// Mock the api client so tests don't make real network requests
vi.mock('../api/client', () => ({
  api: {
    get:   vi.fn(),
    post:  vi.fn(),
    patch: vi.fn(),
  },
  setAuthToken: vi.fn(),
  ApiError: class ApiError extends Error {
    constructor(public status: number, msg: string) { super(msg); }
  },
}));

const { api } = await import('../api/client');

const MOCK_PROJECTS: ProjectsResponse = {
  projects: [
    {
      id: 'p1',
      name: 'Project One',
      description: 'First',
      status: 'active',
      open_milestone_count: 2,
      updated_at: '2026-01-01T00:00:00Z',
      created_at: '2026-01-01T00:00:00Z',
    },
  ],
};

describe('useProjects', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockResolvedValue(MOCK_PROJECTS);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('fetches projects on mount', async () => {
    const { result } = renderHook(() => useProjects());
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.projects).toHaveLength(1);
    expect(result.current.projects[0].name).toBe('Project One');
  });

  it('calls /api/projects without archived flag by default', async () => {
    const { result } = renderHook(() => useProjects());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(api.get).toHaveBeenCalledWith('/api/projects');
  });

  it('calls /api/projects?include_archived=true when includeArchived is true', async () => {
    const { result } = renderHook(() => useProjects(true));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(api.get).toHaveBeenCalledWith('/api/projects?include_archived=true');
  });

  it('sets error when fetch fails', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useProjects());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Network error');
    expect(result.current.projects).toHaveLength(0);
  });

  it('create() posts to /api/projects and refreshes the list', async () => {
    vi.mocked(api.post).mockResolvedValue({ id: 'new-id', message: 'created' });
    const { result } = renderHook(() => useProjects());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await result.current.create({ name: 'New Project' });

    expect(api.post).toHaveBeenCalledWith('/api/projects', { name: 'New Project' });
    // refresh is called after create — api.get should have been called twice
    expect(api.get).toHaveBeenCalledTimes(2);
  });
});

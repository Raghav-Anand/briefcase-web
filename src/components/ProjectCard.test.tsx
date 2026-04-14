import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { ProjectCard } from './ProjectCard';
import type { Project } from '../types';

const BASE_PROJECT: Project = {
  id: 'proj-1',
  name: 'Test Project',
  description: 'A project for testing',
  status: 'active',
  tech_stack: ['Go', 'React'],
  open_milestone_count: 3,
  updated_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
};

function renderCard(overrides: Partial<Project> = {}) {
  const project = { ...BASE_PROJECT, ...overrides };
  return render(
    <MemoryRouter>
      <ProjectCard project={project} />
    </MemoryRouter>,
  );
}

describe('ProjectCard', () => {
  it('renders project name', () => {
    renderCard();
    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });

  it('renders description', () => {
    renderCard();
    expect(screen.getByText('A project for testing')).toBeInTheDocument();
  });

  it('links to the correct project URL', () => {
    renderCard();
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/projects/proj-1');
  });

  it('renders status badge', () => {
    renderCard({ status: 'paused' });
    expect(screen.getByText('Paused')).toBeInTheDocument();
  });

  it('renders open milestone count', () => {
    renderCard({ open_milestone_count: 5 });
    expect(screen.getByText('5 open milestones')).toBeInTheDocument();
  });

  it('shows "No open milestones" when count is 0', () => {
    renderCard({ open_milestone_count: 0 });
    expect(screen.getByText('No open milestones')).toBeInTheDocument();
  });

  it('renders tech stack tags', () => {
    renderCard({ tech_stack: ['Go', 'React', 'Firestore'] });
    expect(screen.getByText('Go')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Firestore')).toBeInTheDocument();
  });

  it('truncates tech stack beyond 5 with overflow count', () => {
    renderCard({ tech_stack: ['A', 'B', 'C', 'D', 'E', 'F', 'G'] });
    expect(screen.getByText('+2 more')).toBeInTheDocument();
  });

  it('renders last session summary when present', () => {
    renderCard({ last_session_summary: 'Set up CI/CD pipeline.' });
    expect(screen.getByText('Set up CI/CD pipeline.')).toBeInTheDocument();
  });

  it('does not render last session block when summary is absent', () => {
    renderCard({ last_session_summary: undefined });
    expect(screen.queryByText('Last session')).not.toBeInTheDocument();
  });
});

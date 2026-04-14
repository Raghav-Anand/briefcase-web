import { Link } from 'react-router-dom';
import type { Project } from '../types';
import { StatusBadge } from './StatusBadge';

function formatRelativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30)  return `${days}d ago`;
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(iso));
}

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      to={`/projects/${project.id}`}
      className="group block bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 hover:bg-slate-800/50 transition-all duration-150"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-slate-100 font-semibold text-base leading-snug group-hover:text-white transition-colors line-clamp-1">
          {project.name}
        </h3>
        <StatusBadge status={project.status} className="shrink-0" />
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 mb-4">
          {project.description}
        </p>
      )}

      {/* Last session summary */}
      {project.last_session_summary && (
        <div className="bg-slate-800 rounded-lg p-3 mb-4 border border-slate-700/50">
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-1">Last session</p>
          <p className="text-slate-300 text-sm line-clamp-2">{project.last_session_summary}</p>
        </div>
      )}

      {/* Tech stack tags */}
      {project.tech_stack && project.tech_stack.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.tech_stack.slice(0, 5).map((tech) => (
            <span
              key={tech}
              className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-400 text-xs"
            >
              {tech}
            </span>
          ))}
          {project.tech_stack.length > 5 && (
            <span className="px-2 py-0.5 text-slate-500 text-xs">
              +{project.tech_stack.length - 5} more
            </span>
          )}
        </div>
      )}

      {/* Footer: milestones + last updated */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-800">
        <span>
          {project.open_milestone_count > 0
            ? `${project.open_milestone_count} open milestone${project.open_milestone_count !== 1 ? 's' : ''}`
            : 'No open milestones'}
        </span>
        <span>{formatRelativeDate(project.updated_at)}</span>
      </div>
    </Link>
  );
}

import type { ProjectStatus, SessionStatus, MilestoneStatus, NoteType } from '../types';

type Status = ProjectStatus | SessionStatus | MilestoneStatus | NoteType | string;

const STYLES: Record<string, string> = {
  // Project statuses
  active:     'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30',
  paused:     'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30',
  completed:  'bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/30',
  archived:   'bg-slate-500/15 text-slate-400 ring-1 ring-slate-500/30',
  // Session statuses
  auto_closed: 'bg-orange-500/15 text-orange-400 ring-1 ring-orange-500/30',
  // Milestone statuses
  open:       'bg-brand-500/15 text-brand-400 ring-1 ring-brand-500/30',
  // Note types
  general:    'bg-slate-500/15 text-slate-400 ring-1 ring-slate-500/30',
  bug:        'bg-red-500/15 text-red-400 ring-1 ring-red-500/30',
  idea:       'bg-violet-500/15 text-violet-400 ring-1 ring-violet-500/30',
  todo:       'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30',
};

const LABELS: Record<string, string> = {
  active:     'Active',
  paused:     'Paused',
  completed:  'Completed',
  archived:   'Archived',
  auto_closed: 'Auto-closed',
  open:       'Open',
  general:    'General',
  bug:        'Bug',
  idea:       'Idea',
  todo:       'Todo',
};

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const style = STYLES[status] ?? 'bg-slate-500/15 text-slate-400 ring-1 ring-slate-500/30';
  const label = LABELS[status] ?? status;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${style} ${className}`}
    >
      {label}
    </span>
  );
}

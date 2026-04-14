// TypeScript types — mirror the API response shapes from briefcase-api.
// All timestamps are ISO 8601 strings.

export interface User {
  email: string;
  display_name: string;
  photo_url?: string;
}

export type ProjectStatus = 'active' | 'paused' | 'completed' | 'archived';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  repo_url?: string;
  tech_stack?: string[];
  last_session_summary?: string;
  open_milestone_count: number;
  updated_at: string;
  created_at: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  repo_url?: string;
  tech_stack?: string[];
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  repo_url?: string;
  tech_stack?: string[];
}

export type SessionStatus = 'active' | 'completed' | 'auto_closed';

export interface Session {
  id: string;
  status: SessionStatus;
  started_at: string;
  ended_at?: string;
  summary?: string;
  next_steps?: string[];
  decisions?: string[];
  tool_call_count: number;
  client_type: string;
  auto_closed: boolean;
  created_at: string;
}

export type MilestoneStatus = 'open' | 'completed';

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  completed_at?: string;
  status: MilestoneStatus;
  session_id?: string;
  created_at: string;
}

export interface CreateMilestoneInput {
  title: string;
  description?: string;
  due_date?: string;
}

export interface Decision {
  id: string;
  decision: string;
  rationale: string;
  session_id: string;
  tags?: string[];
  created_at: string;
}

export type NoteType = 'general' | 'bug' | 'idea' | 'todo';

export interface Note {
  id: string;
  content: string;
  session_id?: string;
  note_type: NoteType;
  created_at: string;
}

export type DocType = 'api_docs' | 'architecture' | 'readme' | 'custom';
export type DocFormat = 'markdown' | 'mermaid';

export interface RepoDoc {
  id: string;
  title: string;
  doc_type: DocType;
  format: DocFormat;
  content?: string;
  gcs_path?: string;
  version: number;
  updated_by: string;
  session_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ToolCallLog {
  id: string;
  tool_name: string;
  args: Record<string, unknown>;
  result?: string;
  called_at: string;
}

export interface SessionDetail extends Session {
  tool_call_log?: ToolCallLog[];
}

// Paginated list wrapper
export interface Paginated<T> {
  items: T[];
  has_more: boolean;
  next_cursor?: string;
}

// API-specific list wrappers (match the actual response keys)
export interface ProjectsResponse {
  projects: Project[];
}

export interface SessionsResponse {
  sessions: Session[];
  has_more: boolean;
  next_cursor?: string;
}

export interface MilestonesResponse {
  milestones: Milestone[];
}

export interface DecisionsResponse {
  decisions: Decision[];
}

export interface NotesResponse {
  notes: Note[];
}

export interface DocsResponse {
  docs: RepoDoc[];
}

export interface Repo {
  id: string;
  name: string;
  url: string;
  description?: string;
  language?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateRepoInput {
  name: string;
  url: string;
  description?: string;
  language?: string;
}

export interface UpdateRepoInput {
  name?: string;
  url?: string;
  description?: string;
  language?: string;
}

export interface ReposResponse {
  repos: Repo[];
}

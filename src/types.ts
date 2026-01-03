export type Priority = 0 | 1 | 2; // 0=normal, 1=medium, 2=high
export type Status = 'inbox' | 'todo' | 'doing' | 'done';
export type ViewMode = 'kanban' | 'calendar' | 'timer';
export type TimeMode = 'daily' | 'weekly';

export interface Task {
  id: number;
  content: string;
  status: Status;
  priority: Priority;
  created_at: string;
  completed_at?: string;
  due_date?: string;
  time_duration?: number; // in minutes
  tags: string[];
}

export interface Tag {
  name: string;
  color: string;
}

export interface CalendarPreset {
  id: number;
  name: string;
  default_tags: string[];
  default_priority: Priority;
}

export interface Theme {
  id: string;
  name: string;
  orbs: OrbConfig[];
}

export interface OrbConfig {
  colors: string[];
  size: number;
  initialX: number;
  initialY: number;
  duration: number;
}

export interface AppSettings {
  theme: string;
  time_mode: TimeMode;
  available_time: number; // in hours
}
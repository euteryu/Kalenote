import { invoke } from '@tauri-apps/api/tauri';
import type { Task, Priority, Status, CalendarPreset, AppSettings } from './types';

export interface DbTask {
  id: number;
  content: string;
  status: Status;
  priority: Priority;
  created_at: string;
  completed_at?: string;
  due_date?: string;
  time_duration?: number;
  tags: string; // JSON string
}

export interface NewTaskDto {
  content: string;
  status: Status;
  priority: Priority;
  tags: string; // JSON string
  time_duration?: number;
  due_date?: string;
}

export interface DbSettings {
  theme: string;
  time_mode: string;
  available_time: number;
}

export interface DbCalendarPreset {
  id: number;
  name: string;
  default_tags: string; // JSON string
  default_priority: Priority;
}

export interface NewPresetDto {
  name: string;
  default_tags: string; // JSON string
  default_priority: Priority;
}

// Convert DB task to app Task
function dbTaskToTask(dbTask: DbTask): Task {
  return {
    ...dbTask,
    tags: JSON.parse(dbTask.tags || '[]'),
  };
}

// Convert app Task to DB format
function taskToDbTask(task: Partial<Task>): Partial<DbTask> {
  const { tags, ...rest } = task;
  return {
    ...rest,
    tags: tags ? JSON.stringify(tags) : undefined,
  };
}

// Convert DB preset to app preset
function dbPresetToPreset(dbPreset: DbCalendarPreset): CalendarPreset {
  return {
    ...dbPreset,
    default_tags: JSON.parse(dbPreset.default_tags || '[]'),
  };
}

export const db = {
  // Tasks
  async getAllTasks(): Promise<Task[]> {
    try {
      const tasks = await invoke<DbTask[]>('get_all_tasks');
      return tasks.map(dbTaskToTask);
    } catch (error) {
      console.error('Failed to get tasks:', error);
      return [];
    }
  },

  async addTask(task: Omit<Task, 'id' | 'created_at'>): Promise<number> {
    try {
      const newTask: NewTaskDto = {
        content: task.content,
        status: task.status,
        priority: task.priority,
        tags: JSON.stringify(task.tags || []),
        time_duration: task.time_duration,
        due_date: task.due_date,
      };
      return await invoke<number>('add_task', { task: newTask });
    } catch (error) {
      console.error('Failed to add task:', error);
      throw error;
    }
  },

  async updateTask(id: number, updates: Partial<Task>): Promise<void> {
    try {
      const dbUpdates = taskToDbTask(updates);
      await invoke('update_task', {
        id,
        content: dbUpdates.content,
        status: dbUpdates.status,
        priority: dbUpdates.priority,
        tags: dbUpdates.tags,
        timeDuration: dbUpdates.time_duration,
        dueDate: dbUpdates.due_date,
        completedAt: dbUpdates.completed_at,
      });
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  },

  async deleteTask(id: number): Promise<void> {
    try {
      await invoke('delete_task', { id });
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error;
    }
  },

  async clearColumn(status: Status): Promise<void> {
    try {
      await invoke('clear_column', { status });
    } catch (error) {
      console.error('Failed to clear column:', error);
      throw error;
    }
  },

  // Settings
  async getSettings(): Promise<AppSettings> {
    try {
      const settings = await invoke<DbSettings>('get_settings');
      return {
        theme: settings.theme,
        time_mode: settings.time_mode as 'daily' | 'weekly',
        available_time: settings.available_time,
      };
    } catch (error) {
      console.error('Failed to get settings:', error);
      return { theme: 'cool-blues', time_mode: 'daily', available_time: 12 };
    }
  },

  async updateSettings(settings: AppSettings): Promise<void> {
    try {
      await invoke('update_settings', { settings });
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  },

  // Calendar Presets
  async getAllPresets(): Promise<CalendarPreset[]> {
    try {
      const presets = await invoke<DbCalendarPreset[]>('get_all_presets');
      return presets.map(dbPresetToPreset);
    } catch (error) {
      console.error('Failed to get presets:', error);
      return [];
    }
  },

  async addPreset(preset: Omit<CalendarPreset, 'id'>): Promise<number> {
    try {
      const newPreset: NewPresetDto = {
        name: preset.name,
        default_tags: JSON.stringify(preset.default_tags),
        default_priority: preset.default_priority,
      };
      return await invoke<number>('add_preset', { preset: newPreset });
    } catch (error) {
      console.error('Failed to add preset:', error);
      throw error;
    }
  },

  async deletePreset(id: number): Promise<void> {
    try {
      await invoke('delete_preset', { id });
    } catch (error) {
      console.error('Failed to delete preset:', error);
      throw error;
    }
  },
};

import { create } from 'zustand';
import type { Task, Tag, CalendarPreset, AppSettings, ViewMode, Theme } from './types';
import { db } from './api';

interface AppState {
  // View state
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;

  // Voice state
  isVoiceActive: boolean;
  setVoiceActive: (active: boolean) => void;

  // Tasks
  tasks: Task[];
  isLoading: boolean;
  initData: () => Promise<void>;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Omit<Task, 'id' | 'created_at'>) => Promise<void>;
  updateTask: (id: number, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  clearColumn: (status: string) => Promise<void>;

  // Tags
  tags: Map<string, string>; // name -> color
  getOrCreateTag: (name: string) => string;

  // Calendar presets
  calendarPresets: CalendarPreset[];
  addCalendarPreset: (preset: Omit<CalendarPreset, 'id'>) => Promise<void>;
  deleteCalendarPreset: (id: number) => Promise<void>;

  // Settings
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeFilters: {
    tags: string[];
    priorities: number[];
    hasTime: boolean | null;
  };
  setActiveFilters: (filters: Partial<AppState['activeFilters']>) => void;
}

// Helper: Generate consistent color from string
const stringToColor = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = hash % 360;
  return `hsl(${h}, 65%, 60%)`;
};

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  currentView: 'kanban',
  isVoiceActive: false,
  tasks: [],
  isLoading: false,
  tags: new Map(),
  calendarPresets: [],
  settings: {
    theme: 'cool-blues',
    time_mode: 'daily',
    available_time: 12,
  },
  searchQuery: '',
  activeFilters: {
    tags: [],
    priorities: [],
    hasTime: null,
  },

  // Actions
  setCurrentView: (view) => set({ currentView: view }),
  setVoiceActive: (active) => set({ isVoiceActive: active }),

  initData: async () => {
    set({ isLoading: true });
    try {
      const [tasks, settings, presets] = await Promise.all([
        db.getAllTasks(),
        db.getSettings(),
        db.getAllPresets(),
      ]);
      
      set({ 
        tasks, 
        settings,
        calendarPresets: presets,
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to load data:', error);
      set({ tasks: [], isLoading: false });
    }
  },

  setTasks: (tasks) => set({ tasks }),

  addTask: async (taskData) => {
    try {
      const id = await db.addTask({
        ...taskData,
        created_at: new Date().toISOString(),
      } as any);
      
      const newTask: Task = {
        ...taskData,
        id,
        created_at: new Date().toISOString(),
      };
      
      set((state) => ({ tasks: [...state.tasks, newTask] }));
    } catch (error) {
      console.error('Failed to add task:', error);
      const newTask: Task = {
        ...taskData,
        id: Date.now(),
        created_at: new Date().toISOString(),
      };
      set((state) => ({ tasks: [...state.tasks, newTask] }));
    }
  },

  updateTask: async (id, updates) => {
    try {
      await db.updateTask(id, updates);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      }));
    } catch (error) {
      console.error('Failed to update task:', error);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      }));
    }
  },

  deleteTask: async (id) => {
    try {
      await db.deleteTask(id);
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
      }));
    } catch (error) {
      console.error('Failed to delete task:', error);
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
      }));
    }
  },

  clearColumn: async (status) => {
    try {
      await db.clearColumn(status as any);
      set((state) => ({
        tasks: state.tasks.filter((t) => t.status !== status),
      }));
    } catch (error) {
      console.error('Failed to clear column:', error);
      set((state) => ({
        tasks: state.tasks.filter((t) => t.status !== status),
      }));
    }
  },

  getOrCreateTag: (name) => {
    const { tags } = get();
    if (tags.has(name)) {
      return tags.get(name)!;
    }
    const color = stringToColor(name);
    set((state) => ({
      tags: new Map(state.tags).set(name, color),
    }));
    return color;
  },

  addCalendarPreset: async (presetData) => {
    try {
      const id = await db.addPreset(presetData);
      const newPreset: CalendarPreset = {
        ...presetData,
        id,
      };
      set((state) => ({
        calendarPresets: [...state.calendarPresets, newPreset],
      }));
    } catch (error) {
      console.error('Failed to add preset:', error);
    }
  },

  deleteCalendarPreset: async (id) => {
    try {
      await db.deletePreset(id);
      set((state) => ({
        calendarPresets: state.calendarPresets.filter((p) => p.id !== id),
      }));
    } catch (error) {
      console.error('Failed to delete preset:', error);
    }
  },

  updateSettings: async (newSettings) => {
    const updatedSettings = { ...get().settings, ...newSettings };
    try {
      await db.updateSettings(updatedSettings);
      set({ settings: updatedSettings });
    } catch (error) {
      console.error('Failed to update settings:', error);
      // Still update locally
      set({ settings: updatedSettings });
    }
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  setActiveFilters: (filters) => {
    set((state) => ({
      activeFilters: { ...state.activeFilters, ...filters },
    }));
  },
}));

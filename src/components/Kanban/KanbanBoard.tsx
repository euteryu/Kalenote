import { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, closestCorners } from '@dnd-kit/core';
import { useStore } from '../../store';
import { Column } from './Column';
import { TaskCard } from './TaskCard';
import { TimeTracker } from './TimeTracker';
import type { Status } from '../../types';

export const KanbanBoard = () => {
  const { tasks, updateTask, addTask, settings } = useStore();
  const [activeId, setActiveId] = useState<number | null>(null);
  const [newTaskContent, setNewTaskContent] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [newTaskTags, setNewTaskTags] = useState('');

  const columns: { status: Status; title: string; icon: string; color: string }[] = [
    { status: 'inbox', title: 'Inbox', icon: '📥', color: '#90A4AE' },
    { status: 'todo', title: 'To Do', icon: '📋', color: '#2196F3' },
    { status: 'doing', title: 'Doing', icon: '🎯', color: '#4CAF50' },
    { status: 'done', title: 'Done', icon: '✅', color: '#9E9E9E' },
  ];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const taskId = active.id as number;
    const newStatus = over.id as Status;
    const task = tasks.find((t) => t.id === taskId);

    if (!task) return;

    // Check time constraint for 'doing' status
    if (newStatus === 'doing' && task.time_duration) {
      const doingTasks = tasks.filter((t) => t.status === 'doing' && t.id !== taskId);
      const totalTime = doingTasks.reduce((sum, t) => sum + (t.time_duration || 0), 0);
      const availableMinutes = settings.available_time * 60;

      if (totalTime + task.time_duration > availableMinutes) {
        const confirmed = window.confirm(
          `Adding this task will exceed your available time by ${Math.ceil((totalTime + task.time_duration - availableMinutes) / 60)} hours. Add anyway?`
        );
        if (!confirmed) return;
      }
    }

    if (task.status !== newStatus) {
      updateTask(taskId, {
        status: newStatus,
        completed_at: newStatus === 'done' ? new Date().toISOString() : undefined,
      });
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskContent.trim()) return;

    const timeDuration = newTaskTime ? parseInt(newTaskTime) : undefined;
    const tags = newTaskTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    addTask({
      content: newTaskContent,
      status: 'inbox',
      priority: 0,
      tags,
      time_duration: timeDuration,
    });

    setNewTaskContent('');
    setNewTaskTime('');
    setNewTaskTags('');
  };

  return (
    <div className="flex flex-col h-full p-6 gap-6">
      {/* Add task form */}
      <form onSubmit={handleAddTask} className="bg-white/30 backdrop-blur-md rounded-2xl p-4 border border-white/30">
        <div className="flex gap-3">
          <textarea
            value={newTaskContent}
            onChange={(e) => setNewTaskContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAddTask(e);
              }
            }}
            placeholder="What needs to be done? (Shift+Enter for new line, Enter to add)"
            className="flex-1 bg-white/50 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            rows={2}
          />
          <input
            type="number"
            value={newTaskTime}
            onChange={(e) => setNewTaskTime(e.target.value)}
            placeholder="Time (min)"
            className="w-24 bg-white/50 rounded-xl px-3 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="text"
            value={newTaskTags}
            onChange={(e) => setNewTaskTags(e.target.value)}
            placeholder="Tags (comma-separated)"
            className="w-48 bg-white/50 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors font-medium"
          >
            Add
          </button>
        </div>
      </form>

      {/* Time tracker */}
      <TimeTracker />

      {/* Kanban columns */}
      <DndContext onDragEnd={handleDragEnd} onDragStart={(e) => setActiveId(e.active.id as number)} collisionDetection={closestCorners}>
        <div className="grid grid-cols-4 gap-6 flex-1 overflow-hidden">
          {columns.map((col) => (
            <Column
              key={col.status}
              {...col}
              tasks={tasks.filter((t) => t.status === col.status)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeId ? (
            <TaskCard task={tasks.find((t) => t.id === activeId)!} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

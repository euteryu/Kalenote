import { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, closestCorners } from '@dnd-kit/core';
import { useStore } from '../../store';
import { Column } from './Column';
import { TaskCard } from './TaskCard';
import { ConfirmModal } from '../ConfirmModal';
import type { Status } from '../../types';

export const KanbanBoard = () => {
  const { tasks, updateTask, addTask, settings } = useStore();
  const [activeId, setActiveId] = useState<number | null>(null);
  const [newTaskContent, setNewTaskContent] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [newTaskTags, setNewTaskTags] = useState('');
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [pendingMove, setPendingMove] = useState<{ taskId: number; newStatus: Status; exceeded: number } | null>(null);

  const columns: { status: Status; title: string; icon: string }[] = [
    { status: 'inbox', title: 'Inbox', icon: '📥' },
    { status: 'todo', title: 'To Do', icon: '📋' },
    { status: 'doing', title: 'Doing', icon: '🎯' },
    { status: 'done', title: 'Done', icon: '✅' },
  ];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    // Clear activeId immediately to prevent visual glitches
    setActiveId(null);

    if (!over) {
      // Card dropped outside - do nothing, stays in original position
      return;
    }

    const taskId = active.id as number;
    const newStatus = over.id as Status;
    const task = tasks.find((t) => t.id === taskId);

    if (!task) return;

    // No change if same status
    if (task.status === newStatus) {
      return;
    }

    // Check time constraint for 'doing' status
    if (newStatus === 'doing' && task.time_duration) {
      const doingTasks = tasks.filter((t) => t.status === 'doing' && t.id !== taskId);
      const totalTime = doingTasks.reduce((sum, t) => sum + (t.time_duration || 0), 0);
      const availableMinutes = settings.available_time * 60;

      if (totalTime + task.time_duration > availableMinutes) {
        const exceededHours = Math.ceil((totalTime + task.time_duration - availableMinutes) / 60);
        setPendingMove({ taskId, newStatus, exceeded: exceededHours });
        setShowTimeWarning(true);
        return;
      }
    }

    // Move task
    updateTask(taskId, {
      status: newStatus,
      completed_at: newStatus === 'done' ? new Date().toISOString() : undefined,
    });
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
    <div className="flex flex-col h-full p-6 gap-4">
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

      {/* Kanban columns */}
      <DndContext 
        onDragEnd={handleDragEnd} 
        onDragStart={(e) => setActiveId(e.active.id as number)} 
        collisionDetection={closestCorners}
      >
        <div className="grid grid-cols-4 gap-6 flex-1 overflow-hidden">
          {columns.map((col) => (
            <Column
              key={col.status}
              {...col}
              tasks={tasks.filter((t) => t.status === col.status)}
            />
          ))}
        </div>

        <DragOverlay 
          dropAnimation={{
            duration: 200,
            easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
          }}
        >
          {activeId ? (
            <div className="transform rotate-3 scale-105 opacity-90">
              <TaskCard task={tasks.find((t) => t.id === activeId)!} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Time limit warning modal */}
      <ConfirmModal
        isOpen={showTimeWarning}
        title="Time Limit Exceeded"
        message={`Adding this task will exceed your available time by ${pendingMove?.exceeded || 0} hours. Add anyway?`}
        onConfirm={() => {
          if (pendingMove) {
            updateTask(pendingMove.taskId, {
              status: pendingMove.newStatus,
              completed_at: pendingMove.newStatus === 'done' ? new Date().toISOString() : undefined,
            });
          }
          setPendingMove(null);
        }}
        onCancel={() => {
          setPendingMove(null);
          setShowTimeWarning(false);
        }}
        confirmText="Add Anyway"
        cancelText="Cancel"
        confirmColor="bg-yellow-500 hover:bg-yellow-600"
      />
    </div>
  );
};

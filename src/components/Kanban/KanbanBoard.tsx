import { useState } from 'react';
import { 
  DndContext, 
  DragEndEvent, 
  DragStartEvent,
  DragCancelEvent,
  DragOverlay, 
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useStore } from '../../store';
import { Column } from './Column';
import { TaskCard } from './TaskCard';
import { ConfirmModal } from '../confirmmodal';
import type { Status } from '../../types';

export const KanbanBoard = () => {
  const { tasks, updateTask, addTask, deleteTask, settings } = useStore();
  const [activeId, setActiveId] = useState<number | null>(null);
  const [newTaskContent, setNewTaskContent] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [newTaskTags, setNewTaskTags] = useState('');
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [pendingMove, setPendingMove] = useState<{ taskId: number; newStatus: Status; exceeded: number } | null>(null);
  
  // Clear column confirmation
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [columnToClear, setColumnToClear] = useState<{ status: Status; title: string } | null>(null);

  // Configure sensors for better drag control
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    })
  );

  const columns: { status: Status; title: string; icon: string }[] = [
    { status: 'inbox', title: 'Inbox', icon: '📥' },
    { status: 'todo', title: 'To Do', icon: '📋' },
    { status: 'doing', title: 'Doing', icon: '🎯' },
    { status: 'done', title: 'Done', icon: '✅' },
  ];

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) {
      return;
    }

    const taskId = active.id as number;
    const task = tasks.find((t) => t.id === taskId);

    if (!task) {
      return;
    }

    let newStatus: Status | null = null;

    const columnStatuses: Status[] = ['inbox', 'todo', 'doing', 'done'];
    if (columnStatuses.includes(over.id as Status)) {
      newStatus = over.id as Status;
    } else {
      const overTask = tasks.find((t) => t.id === over.id);
      if (overTask) {
        newStatus = overTask.status;
      }
    }

    if (!newStatus) {
      return;
    }

    if (task.status === newStatus) {
      return;
    }

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

  const handleClearColumnClick = (status: Status, title: string) => {
    setColumnToClear({ status, title });
    setShowClearConfirm(true);
  };

  const handleConfirmClear = () => {
    if (!columnToClear) return;

    const tasksToDelete = tasks.filter((t) => t.status === columnToClear.status);
    tasksToDelete.forEach((task) => {
      deleteTask(task.id);
    });

    setColumnToClear(null);
    setShowClearConfirm(false);
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
            className="flex-1 min-w-0 bg-white/50 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            rows={2}
          />
          <input
            type="number"
            value={newTaskTime}
            onChange={(e) => setNewTaskTime(e.target.value)}
            placeholder="Time (minutes)"
            className="w-32 flex-shrink-0 bg-white/50 rounded-xl px-3 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="text"
            value={newTaskTags}
            onChange={(e) => setNewTaskTags(e.target.value)}
            placeholder="Tags (comma-separated)"
            className="w-48 flex-shrink-0 bg-white/50 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="px-6 py-3 flex-shrink-0 bg-white/40 hover:bg-white/60 backdrop-blur-md text-gray-700 border border-white/50 rounded-xl transition-all font-medium shadow-lg hover:shadow-xl"
          >
            Add
          </button>
        </div>
      </form>

      {/* Kanban columns */}
      <DndContext 
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        collisionDetection={closestCorners}
      >
        <div className="grid grid-cols-4 gap-6 flex-1 overflow-hidden">
          {columns.map((col) => (
            <Column
              key={col.status}
              {...col}
              tasks={tasks.filter((t) => t.status === col.status)}
              onClearColumn={() => handleClearColumnClick(col.status, col.title)}
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
            <div className="transform rotate-2 scale-105">
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

      {/* Clear column confirmation modal */}
      <ConfirmModal
        isOpen={showClearConfirm}
        title={`Clear ${columnToClear?.title}?`}
        message={`Are you sure you want to delete all ${tasks.filter((t) => t.status === columnToClear?.status).length} task(s) in ${columnToClear?.title}? This action cannot be undone.`}
        onConfirm={handleConfirmClear}
        onCancel={() => {
          setColumnToClear(null);
          setShowClearConfirm(false);
        }}
        confirmText="Clear All"
        cancelText="Cancel"
        confirmColor="bg-red-500 hover:bg-red-600"
      />
    </div>
  );
};

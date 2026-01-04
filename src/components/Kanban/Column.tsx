import { memo, useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableTaskCard } from './SortableTaskCard';
import type { Task, Status } from '../../types';

interface ColumnProps {
  title: string;
  status: Status;
  tasks: Task[];
  icon: string;
}

export const Column = memo(({ title, status, tasks, icon }: ColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  // Sort tasks by priority: High (2) -> Medium (1) -> Normal (0)
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => b.priority - a.priority);
  }, [tasks]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 px-2">
        <span className="text-2xl">{icon}</span>
        <h2 className="text-lg font-medium text-gray-700">{title}</h2>
        <span className="ml-auto text-sm text-gray-500 bg-white/50 px-2 py-1 rounded-full">
          {tasks.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 bg-white/20 backdrop-blur-sm rounded-3xl p-4 border-2 overflow-y-auto transition-all duration-200 ${
          isOver 
            ? 'border-blue-400 bg-blue-50/30 shadow-lg shadow-blue-400/20' 
            : 'border-white/30'
        }`}
        style={{
          minHeight: '400px',
        }}
      >
        <SortableContext items={sortedTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {sortedTasks.map((task) => (
              <SortableTaskCard key={task.id} task={task} />
            ))}
          </div>
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
            {isOver ? '✓ Drop here' : 'Drop tasks here'}
          </div>
        )}
      </div>
    </div>
  );
});

Column.displayName = 'Column';

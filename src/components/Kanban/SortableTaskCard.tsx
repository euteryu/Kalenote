import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskCard } from './TaskCard';
import type { Task } from '../../types';

interface SortableTaskCardProps {
  task: Task;
}

export const SortableTaskCard = ({ task }: SortableTaskCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 999 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <TaskCard task={task} dragHandleProps={{ ref: setActivatorNodeRef, ...listeners }} />
    </div>
  );
};

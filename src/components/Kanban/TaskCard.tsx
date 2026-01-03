import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store';
import { getThemeHoverColor } from '../../utils/themeColors';
import { ConfirmModal } from '../ConfirmModal';
import type { Task, Priority } from '../../types';

interface TaskCardProps {
  task: Task;
}

export const TaskCard = memo(({ task }: TaskCardProps) => {
  const { updateTask, deleteTask, getOrCreateTag, settings } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(task.content);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editContent.trim()) {
      updateTask(task.id, { content: editContent });
    }
    setIsEditing(false);
  };

  const cyclePriority = () => {
    const newPriority = ((task.priority + 1) % 3) as Priority;
    updateTask(task.id, { priority: newPriority });
  };

  const priorityHoverColor = getThemeHoverColor(settings.theme, task.priority);

  const getPriorityBadge = () => {
    switch (task.priority) {
      case 2: return { text: 'HIGH', color: 'bg-red-500' };
      case 1: return { text: 'MED', color: 'bg-yellow-500' };
      default: return { text: '●', color: 'bg-gray-400' };
    }
  };

  const badge = getPriorityBadge();

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`group relative bg-white/40 backdrop-blur-md rounded-2xl p-4 border-2 transition-all duration-300 cursor-pointer ${
          task.status === 'doing'
            ? 'border-blue-400'
            : task.status === 'done'
            ? 'border-gray-300 opacity-60'
            : 'border-white/30 hover:border-white/80'
        }`}
        style={{
          boxShadow: task.status === 'doing' 
            ? '0 0 15px rgba(59, 130, 246, 0.3)' 
            : undefined
        }}
        onMouseEnter={(e) => {
          if (task.status !== 'done') {
            (e.currentTarget as HTMLElement).style.boxShadow = `0 0 10px ${priorityHoverColor}, 0 0 20px ${priorityHoverColor}, 0 0 30px ${priorityHoverColor}`;
          }
        }}
        onMouseLeave={(e) => {
          if (task.status === 'doing') {
            (e.currentTarget as HTMLElement).style.boxShadow = '0 0 15px rgba(59, 130, 246, 0.3)';
          } else {
            (e.currentTarget as HTMLElement).style.boxShadow = '';
          }
        }}
      >
        {/* Priority Badge */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            cyclePriority();
          }}
          className={`absolute -top-2 -left-2 ${badge.color} text-white text-xs px-2 py-1 rounded-full shadow-md hover:scale-110 transition-transform z-10`}
          title="Click to change priority (Normal → Medium → High)"
        >
          {badge.text}
        </button>

        {/* Content */}
        {isEditing ? (
          <textarea
            autoFocus
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSave();
              }
            }}
            className="w-full bg-white/50 rounded-lg p-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            rows={3}
          />
        ) : (
          <div
            onDoubleClick={handleDoubleClick}
            className="text-gray-800 cursor-text leading-relaxed"
          >
            {task.content.split('\n').map((line, idx) => {
              const trimmed = line.trim();
              // Check if line starts with bullet point
              const isBullet = trimmed.startsWith('-') || trimmed.startsWith('•');
              const bulletContent = isBullet ? trimmed.substring(1).trim() : trimmed;

              return (
                <div key={idx} className={isBullet ? 'flex items-start gap-2 ml-2' : ''}>
                  {isBullet && <span className="text-blue-500 mt-1">•</span>}
                  <span className={isBullet ? 'flex-1' : ''}>{bulletContent || '\u00A0'}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Tags */}
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {task.tags.map((tag) => {
              const color = getOrCreateTag(tag);
              return (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs rounded-full text-white"
                  style={{ backgroundColor: color }}
                >
                  {tag}
                </span>
              );
            })}
          </div>
        )}

        {/* Time duration */}
        {task.time_duration && (
          <div className="mt-2 text-sm text-gray-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {Math.floor(task.time_duration / 60)}h {task.time_duration % 60}m
          </div>
        )}

        {/* Delete button (on hover) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowDeleteConfirm(true);
          }}
          className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 flex items-center justify-center text-xs z-10"
        >
          ×
        </button>
      </motion.div>

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Task?"
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={() => deleteTask(task.id)}
        onCancel={() => setShowDeleteConfirm(false)}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  return (
    prevProps.task.id === nextProps.task.id &&
    prevProps.task.content === nextProps.task.content &&
    prevProps.task.status === nextProps.task.status &&
    prevProps.task.priority === nextProps.task.priority &&
    prevProps.task.tags.length === nextProps.task.tags.length &&
    prevProps.task.time_duration === nextProps.task.time_duration
  );
});

TaskCard.displayName = 'TaskCard';

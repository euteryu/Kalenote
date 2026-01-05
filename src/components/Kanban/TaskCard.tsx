import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store';
import { getThemeHoverColor } from '../../utils/themecolors';
import { ConfirmModal } from '../confirmmodal';
import type { Task, Priority } from '../../types';

interface TaskCardProps {
  task: Task;
  dragHandleProps?: any;
}

export const TaskCard = memo(({ task, dragHandleProps }: TaskCardProps) => {
  const { updateTask, deleteTask, getOrCreateTag, settings } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(task.content);
  const [editHours, setEditHours] = useState('');
  const [editMinutes, setEditMinutes] = useState('');
  const [editTags, setEditTags] = useState(task.tags.join(', '));
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleEditClick = () => {
    setIsEditing(true);
    setEditContent(task.content);
    
    // Convert total minutes to hours and minutes
    if (task.time_duration) {
      const hours = Math.floor(task.time_duration / 60);
      const minutes = task.time_duration % 60;
      setEditHours(hours > 0 ? hours.toString() : '');
      setEditMinutes(minutes > 0 ? minutes.toString() : '');
    } else {
      setEditHours('');
      setEditMinutes('');
    }
    
    setEditTags(task.tags.join(', '));
  };

  const handleSave = () => {
    if (editContent.trim()) {
      // Convert hours and minutes to total minutes
      const hours = parseInt(editHours) || 0;
      const minutes = Math.min(parseInt(editMinutes) || 0, 59); // Cap at 59
      const timeDuration = hours > 0 || minutes > 0 ? hours * 60 + minutes : undefined;
      
      const tags = editTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      updateTask(task.id, { 
        content: editContent,
        time_duration: timeDuration,
        tags
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditContent(task.content);
    setEditHours('');
    setEditMinutes('');
    setEditTags(task.tags.join(', '));
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
      default: return { text: '●', color: 'bg-white/40 backdrop-blur-sm border border-white/30' };
    }
  };

  const badge = getPriorityBadge();

  return (
    <>
      <motion.div
        {...(dragHandleProps && !isEditing ? dragHandleProps : {})}
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`group relative bg-white/40 backdrop-blur-md rounded-2xl p-4 border-2 transition-all duration-300 ${
          !isEditing ? 'cursor-grab active:cursor-grabbing' : ''
        } ${
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
            (e.currentTarget as HTMLElement).style.borderColor = priorityHoverColor.replace('0.6', '0.8');
          }
        }}
        onMouseLeave={(e) => {
          if (task.status === 'doing') {
            (e.currentTarget as HTMLElement).style.boxShadow = '0 0 15px rgba(59, 130, 246, 0.3)';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgb(96, 165, 250)';
          } else {
            (e.currentTarget as HTMLElement).style.boxShadow = '';
            (e.currentTarget as HTMLElement).style.borderColor = '';
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
        <div>
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Content</label>
                <textarea
                  autoFocus
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSave();
                    }
                    if (e.key === 'Escape') {
                      handleCancel();
                    }
                  }}
                  className="w-full bg-white/70 rounded-lg p-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                  rows={3}
                  placeholder="Task content..."
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <label className="text-xs text-gray-600 block">Time</label>
                  <div className="flex gap-2 items-center">
                    <div className="flex-1">
                      <input
                        type="number"
                        min="0"
                        value={editHours}
                        onChange={(e) => setEditHours(e.target.value)}
                        className="w-full bg-white/70 rounded-lg p-2 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="0"
                      />
                      <span className="text-xs text-gray-500 mt-0.5 block">hours</span>
                    </div>
                    <div className="flex-1">
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={editMinutes}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (e.target.value === '' || (val >= 0 && val <= 59)) {
                            setEditMinutes(e.target.value);
                          }
                        }}
                        className="w-full bg-white/70 rounded-lg p-2 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="0"
                      />
                      <span className="text-xs text-gray-500 mt-0.5 block">min</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Tags</label>
                  <input
                    type="text"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    className="w-full bg-white/70 rounded-lg p-2 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="tag1, tag2"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-white/40 hover:bg-white/60 backdrop-blur-md border border-white/50 text-gray-800 text-sm rounded-xl transition-all font-medium shadow-lg hover:shadow-xl"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-white/40 hover:bg-white/60 backdrop-blur-md border border-white/50 text-gray-800 text-sm rounded-xl transition-all shadow-lg hover:shadow-xl"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-gray-800 leading-relaxed">
                {task.content.split('\n').map((line, idx) => {
                  const trimmed = line.trim();
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
            </>
          )}
        </div>

        {/* Edit and Delete buttons (on hover) */}
        {!isEditing && (
          <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEditClick();
              }}
              className="bg-blue-500 text-white w-6 h-6 rounded-full hover:bg-blue-600 flex items-center justify-center text-xs z-10"
              title="Edit task"
            >
              ✏️
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(true);
              }}
              className="bg-red-500 text-white w-6 h-6 rounded-full hover:bg-red-600 flex items-center justify-center text-xs z-10"
              title="Delete task"
            >
              ×
            </button>
          </div>
        )}
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

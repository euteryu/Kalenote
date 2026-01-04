import { useState } from 'react';
import { useStore } from '../../store';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfirmModal } from '../ConfirmModal';

export const CalendarView = () => {
  const { tasks, addTask, updateTask, deleteTask, calendarPresets } = useStore();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'add'>('view');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  
  // Custom task input modal state
  const [showCustomTaskModal, setShowCustomTaskModal] = useState(false);
  const [customTaskName, setCustomTaskName] = useState('');

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    
    const tasksOnDate = tasks.filter(
      (t) => t.due_date && new Date(t.due_date).toDateString() === date.toDateString()
    );
    
    if (tasksOnDate.length > 0) {
      setModalMode('view');
    } else {
      setModalMode('add');
    }
    
    setShowModal(true);
  };

  const handlePresetClick = (preset: typeof calendarPresets[0]) => {
    if (!selectedDate) return;

    addTask({
      content: `${preset.name} - ${selectedDate.toLocaleDateString()}`,
      status: 'todo',
      priority: preset.default_priority,
      tags: preset.default_tags,
      due_date: selectedDate.toISOString(),
    });

    setShowModal(false);
    setSelectedDate(null);
  };

  const handleCustomTaskClick = () => {
    setShowCustomTaskModal(true);
  };

  const handleCustomTaskSubmit = () => {
    if (!selectedDate || !customTaskName.trim()) return;

    addTask({
      content: customTaskName,
      status: 'todo',
      priority: 0,
      tags: [],
      due_date: selectedDate.toISOString(),
    });

    setCustomTaskName('');
    setShowCustomTaskModal(false);
    setShowModal(false);
    setSelectedDate(null);
  };

  const handleDeleteClick = (taskId: number) => {
    setTaskToDelete(taskId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete);
      setTaskToDelete(null);
    }
    setShowDeleteConfirm(false);
  };

  const handleEditClick = (taskId: number, currentContent: string) => {
    setEditingTaskId(taskId);
    setEditContent(currentContent);
  };

  const handleSaveEdit = (taskId: number) => {
    if (editContent.trim()) {
      updateTask(taskId, { content: editContent });
    }
    setEditingTaskId(null);
    setEditContent('');
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditContent('');
  };

  const days = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getTasksForSelectedDate = () => {
    if (!selectedDate) return [];
    return tasks.filter(
      (t) => t.due_date && new Date(t.due_date).toDateString() === selectedDate.toDateString()
    );
  };

  const getPriorityBadge = (priority: number) => {
    switch (priority) {
      case 2: return { text: 'HIGH', color: 'bg-red-500' };
      case 1: return { text: 'MED', color: 'bg-yellow-500' };
      default: return { text: '●', color: 'bg-gray-400' };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'inbox': return '📥 Inbox';
      case 'todo': return '📋 To Do';
      case 'doing': return '🎯 Doing';
      case 'done': return '✅ Done';
      default: return status;
    }
  };

  return (
    <div className="p-6 h-full flex flex-col overflow-hidden">
      <div className="bg-white/30 backdrop-blur-md rounded-3xl p-6 border border-white/30 flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <button
            onClick={goToPreviousMonth}
            className="px-4 py-2 bg-white/40 hover:bg-white/60 backdrop-blur-md border border-white/50 rounded-xl transition-all"
          >
            ← Prev
          </button>
          <h2 className="text-2xl font-light text-gray-800">{monthName}</h2>
          <button
            onClick={goToNextMonth}
            className="px-4 py-2 bg-white/40 hover:bg-white/60 backdrop-blur-md border border-white/50 rounded-xl transition-all"
          >
            Next →
          </button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 gap-2 mb-2 flex-shrink-0">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>

        {/* Scrollable calendar grid */}
        <div className="overflow-y-auto overflow-x-hidden flex-1 custom-scrollbar">
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              if (!day) return <div key={`empty-${index}`} className="aspect-square" />;

              const tasksOnDay = tasks.filter(
                (t) => t.due_date && new Date(t.due_date).toDateString() === day.toDateString()
              );
              const today = isToday(day);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => handleDateClick(day)}
                  className={`aspect-square bg-white/40 hover:bg-white/60 rounded-xl p-2 transition-all hover:scale-105 border ${
                    today
                      ? 'border-blue-500 shadow-lg shadow-blue-500/30'
                      : 'border-white/30 hover:border-blue-400'
                  }`}
                >
                  <div className={`font-medium ${today ? 'text-blue-600' : 'text-gray-800'}`}>
                    {day.getDate()}
                  </div>
                  {tasksOnDay.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1 justify-center">
                      {tasksOnDay.slice(0, 3).map((task, idx) => (
                        <div
                          key={idx}
                          className={`w-1.5 h-1.5 rounded-full ${
                            task.priority === 2
                              ? 'bg-red-500'
                              : task.priority === 1
                              ? 'bg-yellow-500'
                              : 'bg-blue-500'
                          }`}
                        />
                      ))}
                      {tasksOnDay.length > 3 && (
                        <div className="text-xs text-gray-600">+{tasksOnDay.length - 3}</div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Task Modal */}
      <AnimatePresence>
        {showModal && selectedDate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-lg w-full mx-4 border-2 border-white/50 shadow-2xl max-h-[80vh] flex flex-col"
            >
              <h3 className="text-2xl font-light mb-4 text-gray-800">
                {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </h3>

              {modalMode === 'view' && (
                <div className="flex-1 overflow-y-auto custom-scrollbar mb-6">
                  <div className="space-y-3">
                    {getTasksForSelectedDate().map((task) => {
                      const badge = getPriorityBadge(task.priority);
                      const isEditing = editingTaskId === task.id;
                      
                      return (
                        <div
                          key={task.id}
                          className="bg-white/60 rounded-xl p-4 border border-white/50"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`${badge.color} text-white text-xs px-2 py-1 rounded-full`}>
                                  {badge.text}
                                </span>
                                <span className="text-xs text-gray-600">{getStatusText(task.status)}</span>
                              </div>
                              
                              {isEditing ? (
                                <div className="space-y-2">
                                  <textarea
                                    autoFocus
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSaveEdit(task.id);
                                      }
                                      if (e.key === 'Escape') {
                                        handleCancelEdit();
                                      }
                                    }}
                                    className="w-full bg-white/70 rounded-lg p-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                                    rows={3}
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleSaveEdit(task.id)}
                                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={handleCancelEdit}
                                      className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <p className="text-gray-800 leading-relaxed">{task.content}</p>
                                  {task.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                      {task.tags.map((tag) => (
                                        <span
                                          key={tag}
                                          className="px-2 py-1 text-xs rounded-full bg-blue-500 text-white"
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                            
                            {!isEditing && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditClick(task.id, task.content)}
                                  className="text-blue-500 hover:text-blue-600 text-sm"
                                  title="Edit task"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(task.id)}
                                  className="text-red-500 hover:text-red-600 text-sm"
                                  title="Delete task"
                                >
                                  ✕
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setModalMode('add')}
                    className="w-full mt-4 px-4 py-3 bg-white/40 hover:bg-white/60 backdrop-blur-md border border-white/50 text-gray-800 rounded-xl transition-all font-medium"
                  >
                    ➕ Add Another Task
                  </button>
                </div>
              )}

              {modalMode === 'add' && (
                <div className="space-y-2 mb-6">
                  {calendarPresets.length > 0 ? (
                    <>
                      <p className="text-sm text-gray-600 mb-3">Choose a preset:</p>
                      {calendarPresets.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => handlePresetClick(preset)}
                          className="w-full text-left px-4 py-3 bg-white/50 hover:bg-white/70 rounded-xl transition-colors flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium text-gray-800">{preset.name}</div>
                            {preset.default_tags.length > 0 && (
                              <div className="text-xs text-gray-600 mt-1">
                                {preset.default_tags.join(', ')}
                              </div>
                            )}
                          </div>
                          <div className={`w-3 h-3 rounded-full ${
                            preset.default_priority === 2
                              ? 'bg-red-500'
                              : preset.default_priority === 1
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`} />
                        </button>
                      ))}
                      <div className="border-t border-gray-300 my-3" />
                    </>
                  ) : (
                    <p className="text-gray-600 text-center py-4">
                      No presets. Create one in Settings!
                    </p>
                  )}
                  
                  <button
                    onClick={handleCustomTaskClick}
                    className="w-full text-left px-4 py-3 bg-white/40 hover:bg-white/60 backdrop-blur-md border border-white/50 text-gray-800 rounded-xl transition-all"
                  >
                    ✏️ Custom Task
                  </button>
                  
                  {getTasksForSelectedDate().length > 0 && (
                    <button
                      onClick={() => setModalMode('view')}
                      className="w-full px-4 py-3 bg-white/30 hover:bg-white/50 text-gray-700 rounded-xl transition-all text-sm"
                    >
                      ← Back to Tasks
                    </button>
                  )}
                </div>
              )}

              <button
                onClick={() => setShowModal(false)}
                className="w-full px-4 py-2 bg-white/40 hover:bg-white/60 backdrop-blur-md border border-white/50 text-gray-800 rounded-xl transition-all"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Task Input Modal */}
      <AnimatePresence>
        {showCustomTaskModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={() => {
              setShowCustomTaskModal(false);
              setCustomTaskName('');
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full mx-4 border-2 border-white/50 shadow-2xl"
            >
              <h3 className="text-2xl font-light mb-4 text-gray-800">Enter Task Name</h3>
              
              <input
                autoFocus
                type="text"
                value={customTaskName}
                onChange={(e) => setCustomTaskName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCustomTaskSubmit();
                  }
                  if (e.key === 'Escape') {
                    setShowCustomTaskModal(false);
                    setCustomTaskName('');
                  }
                }}
                placeholder="Task name..."
                className="w-full bg-white/70 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-6"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCustomTaskModal(false);
                    setCustomTaskName('');
                  }}
                  className="flex-1 px-4 py-2 bg-white/40 hover:bg-white/60 backdrop-blur-md border border-white/50 text-gray-800 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCustomTaskSubmit}
                  disabled={!customTaskName.trim()}
                  className="flex-1 px-4 py-2 bg-white/40 hover:bg-white/60 backdrop-blur-md border border-white/50 text-gray-800 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Add Task
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Task?"
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setTaskToDelete(null);
        }}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="bg-red-500 hover:bg-red-600"
      />
    </div>
  );
};

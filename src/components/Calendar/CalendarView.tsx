import { useState } from 'react';
import { useStore } from '../../store';
import { motion, AnimatePresence } from 'framer-motion';

export const CalendarView = () => {
  const { tasks, addTask, calendarPresets } = useStore();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add all days in month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowPresetModal(true);
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

    setShowPresetModal(false);
    setSelectedDate(null);
  };

  const handleCustomTask = () => {
    if (!selectedDate) return;
    
    const taskName = prompt('Enter task name:');
    if (!taskName) return;

    addTask({
      content: taskName,
      status: 'todo',
      priority: 0,
      tags: [],
      due_date: selectedDate.toISOString(),
    });

    setShowPresetModal(false);
    setSelectedDate(null);
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

  return (
    <div className="p-6 h-full flex flex-col overflow-hidden">
      <div className="bg-white/30 backdrop-blur-md rounded-3xl p-6 border border-white/30 flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <button
            onClick={goToPreviousMonth}
            className="px-4 py-2 bg-white/50 rounded-xl hover:bg-white/70 transition-colors"
          >
            ← Prev
          </button>
          <h2 className="text-2xl font-light text-gray-800">{monthName}</h2>
          <button
            onClick={goToNextMonth}
            className="px-4 py-2 bg-white/50 rounded-xl hover:bg-white/70 transition-colors"
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

      {/* Preset modal */}
      <AnimatePresence>
        {showPresetModal && selectedDate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={() => setShowPresetModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full mx-4 border border-white/50"
            >
              <h3 className="text-2xl font-light mb-4 text-gray-800">
                {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              </h3>

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
                  onClick={handleCustomTask}
                  className="w-full text-left px-4 py-3 bg-white/40 hover:bg-white/60 backdrop-blur-md border border-white/50 text-gray-800 rounded-xl transition-all"
                >
                  ✏️ Custom Task
                </button>
              </div>

              <button
                onClick={() => setShowPresetModal(false)}
                className="w-full px-4 py-2 bg-white/40 hover:bg-white/60 backdrop-blur-md border border-white/50 text-gray-800 rounded-xl transition-all"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

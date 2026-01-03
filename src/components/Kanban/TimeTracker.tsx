import { useStore } from '../../store';
import { motion } from 'framer-motion';

export const TimeTracker = () => {
  const { tasks, settings, updateSettings } = useStore();

  const doingTasks = tasks.filter((t) => t.status === 'doing');
  const totalTime = doingTasks.reduce((sum, t) => sum + (t.time_duration || 0), 0);
  const availableMinutes = settings.available_time * 60;
  const usedPercentage = Math.min((totalTime / availableMinutes) * 100, 100);
  const isOvertime = totalTime > availableMinutes;

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="bg-white/30 backdrop-blur-md rounded-2xl p-4 border border-white/30">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="font-medium text-gray-700">Time Tracker</h3>
        </div>

        <select
          value={settings.time_mode}
          onChange={(e) => updateSettings({ time_mode: e.target.value as 'daily' | 'weekly' })}
          className="bg-white/50 rounded-lg px-2 py-1 text-sm text-gray-700 border-none focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{formatTime(totalTime)}</span>
          <span>{formatTime(availableMinutes)}</span>
        </div>
        <div className="w-full h-3 bg-white/50 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${usedPercentage}%` }}
            className={`h-full ${isOvertime ? 'bg-red-500' : 'bg-blue-500'}`}
          />
        </div>
      </div>

      {/* Warning */}
      {isOvertime && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/20 text-red-700 text-sm rounded-lg p-3 border border-red-500/30"
        >
          ⚠️ Tasks exceed available time by {formatTime(totalTime - availableMinutes)}
        </motion.div>
      )}

      {/* Settings */}
      <div className="mt-3 pt-3 border-t border-white/30">
        <label className="text-sm text-gray-600 block mb-2">
          Available Time ({settings.time_mode})
        </label>
        <input
          type="number"
          min="1"
          max="24"
          value={settings.available_time}
          onChange={(e) => updateSettings({ available_time: parseInt(e.target.value) || 12 })}
          className="w-full bg-white/50 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
    </div>
  );
};
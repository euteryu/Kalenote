import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { useToast } from '../hooks/useToast';
import { themes } from '../themes';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const { settings, updateSettings, calendarPresets, addCalendarPreset, deleteCalendarPreset } = useStore();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'general' | 'presets'>('general');
  
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetTags, setNewPresetTags] = useState('');
  const [newPresetPriority, setNewPresetPriority] = useState<0 | 1 | 2>(0);

  const handleAddPreset = () => {
    if (!newPresetName.trim()) {
      addToast('Please enter a preset name', 'warning');
      return;
    }
    
    const tags = newPresetTags.split(',').map(t => t.trim()).filter(Boolean);
    
    addCalendarPreset({
      name: newPresetName,
      default_tags: tags,
      default_priority: newPresetPriority,
    });

    addToast(`Preset "${newPresetName}" created ✓`, 'success');
    
    setNewPresetName('');
    setNewPresetTags('');
    setNewPresetPriority(0);
  };

  const handleDeletePreset = (preset: typeof calendarPresets[0]) => {
    deleteCalendarPreset(preset.id);
    addToast(`Preset "${preset.name}" deleted`, 'info');
  };

  const handleUpdateSettings = (updates: Partial<typeof settings>) => {
    updateSettings(updates);
    addToast('Settings saved ✓', 'success');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-2xl w-full mx-4 border-2 border-white/50 shadow-2xl max-h-[80vh] overflow-y-auto custom-scrollbar"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-light text-gray-800">Settings</h2>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-gray-500/20 hover:bg-gray-500/30 rounded-full transition-colors flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab('general')}
                className={`px-6 py-2 rounded-xl transition-all ${
                  activeTab === 'general'
                    ? 'bg-white/50 shadow-lg backdrop-blur-md border border-white/50'
                    : 'bg-white/30 hover:bg-white/40'
                }`}
              >
                General
              </button>
              <button
                onClick={() => setActiveTab('presets')}
                className={`px-6 py-2 rounded-xl transition-all ${
                  activeTab === 'presets'
                    ? 'bg-white/50 shadow-lg backdrop-blur-md border border-white/50'
                    : 'bg-white/30 hover:bg-white/40'
                }`}
              >
                Calendar Presets
              </button>
            </div>

            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Theme
                  </label>
                  <select
                    value={settings.theme}
                    onChange={(e) => handleUpdateSettings({ theme: e.target.value })}
                    className="w-full bg-white/50 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    {themes.map((theme) => (
                      <option key={theme.id} value={theme.id}>
                        {theme.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Tracking Mode
                  </label>
                  <select
                    value={settings.time_mode}
                    onChange={(e) => handleUpdateSettings({ time_mode: e.target.value as 'daily' | 'weekly' })}
                    className="w-full bg-white/50 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Time ({settings.time_mode})
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      max="168"
                      value={settings.available_time}
                      onChange={(e) => handleUpdateSettings({ available_time: parseInt(e.target.value) || 12 })}
                      className="flex-1 bg-white/50 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <span className="text-gray-600">hours</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Total time available for tasks in the "Doing" column
                  </p>
                </div>
              </div>
            )}

            {/* Calendar Presets */}
            {activeTab === 'presets' && (
              <div className="space-y-6">
                <div className="bg-white/40 backdrop-blur-md rounded-2xl p-4 border border-white/30 space-y-3">
                  <h3 className="font-medium text-gray-800">Add New Preset</h3>
                  
                  <input
                    type="text"
                    placeholder="Preset name (e.g., 'Exam Due')"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    className="w-full bg-white/70 rounded-xl px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  
                  <input
                    type="text"
                    placeholder="Default tags (comma-separated)"
                    value={newPresetTags}
                    onChange={(e) => setNewPresetTags(e.target.value)}
                    className="w-full bg-white/70 rounded-xl px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-gray-700">Default Priority:</label>
                    <select
                      value={newPresetPriority}
                      onChange={(e) => setNewPresetPriority(parseInt(e.target.value) as 0 | 1 | 2)}
                      className="bg-white/70 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="0">Normal</option>
                      <option value="1">Medium</option>
                      <option value="2">High</option>
                    </select>
                  </div>

                  <button
                    onClick={handleAddPreset}
                    className="w-full px-4 py-2 bg-white/40 hover:bg-white/60 backdrop-blur-md border border-white/50 text-gray-800 rounded-xl transition-all font-medium shadow-lg hover:shadow-xl"
                  >
                    Add Preset
                  </button>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-gray-800 mb-3">Your Presets</h3>
                  
                  {calendarPresets.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      No presets yet. Add one above!
                    </p>
                  ) : (
                    calendarPresets.map((preset) => (
                      <div
                        key={preset.id}
                        className="bg-white/50 rounded-xl p-4 flex items-center justify-between"
                      >
                        <div>
                          <h4 className="font-medium text-gray-800">{preset.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            {preset.default_tags.length > 0 && (
                              <span className="text-sm text-gray-600">
                                Tags: {preset.default_tags.join(', ')}
                              </span>
                            )}
                            <span className="text-sm text-gray-600">
                              • Priority: {preset.default_priority === 2 ? 'High' : preset.default_priority === 1 ? 'Medium' : 'Normal'}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeletePreset(preset)}
                          className="w-8 h-8 bg-red-500/20 hover:bg-red-500/30 rounded-full transition-colors flex items-center justify-center text-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full mt-6 px-6 py-3 bg-white/40 hover:bg-white/60 backdrop-blur-md border border-white/50 text-gray-800 rounded-xl transition-all shadow-lg hover:shadow-xl"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

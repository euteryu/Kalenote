import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store';

export const SearchFilter = () => {
  const { searchQuery, setSearchQuery, activeFilters, setActiveFilters, tags } = useStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const allTags = Array.from(tags.keys());
  const priorities = [
    { value: 2, label: 'High', color: 'bg-red-500' },
    { value: 1, label: 'Medium', color: 'bg-yellow-500' },
    { value: 0, label: 'Normal', color: 'bg-green-500' },
  ];

  const toggleTag = (tag: string) => {
    if (activeFilters.tags.includes(tag)) {
      setActiveFilters({ tags: activeFilters.tags.filter(t => t !== tag) });
    } else {
      setActiveFilters({ tags: [...activeFilters.tags, tag] });
    }
  };

  const togglePriority = (priority: number) => {
    if (activeFilters.priorities.includes(priority)) {
      setActiveFilters({ priorities: activeFilters.priorities.filter(p => p !== priority) });
    } else {
      setActiveFilters({ priorities: [...activeFilters.priorities, priority] });
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setActiveFilters({ tags: [], priorities: [], hasTime: null });
  };

  const hasActiveFilters = searchQuery || activeFilters.tags.length > 0 || activeFilters.priorities.length > 0 || activeFilters.hasTime !== null;

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`px-4 py-2 rounded-xl transition-all ${
          hasActiveFilters
            ? 'bg-blue-500 text-white shadow-lg'
            : 'bg-white/30 hover:bg-white/40 text-gray-700'
        }`}
      >
        🔍 Filter {hasActiveFilters && `(${activeFilters.tags.length + activeFilters.priorities.length})`}
      </button>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ 
          x: isExpanded ? 0 : -320,
          opacity: isExpanded ? 1 : 0
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed left-0 top-[73px] bottom-0 w-80 bg-white/90 backdrop-blur-xl border-r border-white/50 shadow-2xl z-40 overflow-y-auto"
      >
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-medium text-gray-800">Search & Filter</h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="w-8 h-8 bg-gray-500/20 hover:bg-gray-500/30 rounded-full transition-colors flex items-center justify-center"
            >
              ✕
            </button>
          </div>

          {/* Search Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Tasks
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by content..."
              className="w-full bg-white/70 rounded-xl px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Tag Filters */}
          {allTags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => {
                  const isActive = activeFilters.tags.includes(tag);
                  const color = tags.get(tag)!;
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-sm transition-all ${
                        isActive
                          ? 'text-white shadow-lg scale-105'
                          : 'bg-white/70 text-gray-700 hover:bg-white'
                      }`}
                      style={isActive ? { backgroundColor: color } : {}}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Priority Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Priority
            </label>
            <div className="space-y-2">
              {priorities.map((priority) => {
                const isActive = activeFilters.priorities.includes(priority.value);
                return (
                  <button
                    key={priority.value}
                    onClick={() => togglePriority(priority.value)}
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${
                      isActive
                        ? 'bg-blue-100 border-2 border-blue-500'
                        : 'bg-white/70 hover:bg-white border-2 border-transparent'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full ${priority.color}`} />
                    <span className="text-gray-800">{priority.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Time
            </label>
            <div className="space-y-2">
              <button
                onClick={() => setActiveFilters({ hasTime: activeFilters.hasTime === true ? null : true })}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${
                  activeFilters.hasTime === true
                    ? 'bg-blue-100 border-2 border-blue-500'
                    : 'bg-white/70 hover:bg-white border-2 border-transparent'
                }`}
              >
                <span className="text-gray-800">Has time estimate</span>
              </button>
              <button
                onClick={() => setActiveFilters({ hasTime: activeFilters.hasTime === false ? null : false })}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${
                  activeFilters.hasTime === false
                    ? 'bg-blue-100 border-2 border-blue-500'
                    : 'bg-white/70 hover:bg-white border-2 border-transparent'
                }`}
              >
                <span className="text-gray-800">No time estimate</span>
              </button>
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </div>
      </motion.div>

      {/* Backdrop when expanded */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsExpanded(false)}
          className="fixed inset-0 bg-black/20 z-30"
          style={{ top: '73px' }}
        />
      )}
    </div>
  );
};

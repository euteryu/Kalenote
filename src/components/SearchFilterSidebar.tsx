import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { useState } from 'react';

interface SearchFilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchFilterSidebar = ({ isOpen, onClose }: SearchFilterSidebarProps) => {
  const { 
    searchQuery, 
    setSearchQuery, 
    activeFilters, 
    setActiveFilters,
    tasks,
    tags
  } = useStore();

  const [localQuery, setLocalQuery] = useState(searchQuery);

  // Get all unique tags from tasks
  const allTags = Array.from(new Set(tasks.flatMap(t => t.tags)));

  const handleSearch = () => {
    setSearchQuery(localQuery);
  };

  const toggleTag = (tag: string) => {
    const newTags = activeFilters.tags.includes(tag)
      ? activeFilters.tags.filter(t => t !== tag)
      : [...activeFilters.tags, tag];
    setActiveFilters({ tags: newTags });
  };

  const togglePriority = (priority: number) => {
    const newPriorities = activeFilters.priorities.includes(priority)
      ? activeFilters.priorities.filter(p => p !== priority)
      : [...activeFilters.priorities, priority];
    setActiveFilters({ priorities: newPriorities });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setLocalQuery('');
    setActiveFilters({ tags: [], priorities: [], hasTime: null });
  };

  const activeFilterCount = 
    activeFilters.tags.length + 
    activeFilters.priorities.length + 
    (activeFilters.hasTime !== null ? 1 : 0) +
    (searchQuery ? 1 : 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 z-50 w-80 bg-white/90 backdrop-blur-xl shadow-2xl border-r border-white/50"
          >
            <div className="flex flex-col h-full p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-light text-gray-800">Search & Filter</h2>
                  {activeFilterCount > 0 && (
                    <div className="text-sm text-gray-500 mt-1">
                      {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
                    </div>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto space-y-6">
                {/* Search */}
                <section>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Search</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={localQuery}
                      onChange={(e) => setLocalQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSearch();
                      }}
                      placeholder="Search tasks..."
                      className="flex-1 bg-white/70 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                      onClick={handleSearch}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                      🔍
                    </button>
                  </div>
                  {searchQuery && (
                    <div className="mt-2 text-sm text-gray-600">
                      Searching for: "{searchQuery}"
                    </div>
                  )}
                </section>

                {/* Priority Filter */}
                <section>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Priority</h3>
                  <div className="space-y-2">
                    {[
                      { value: 2, label: 'High', color: 'bg-red-500' },
                      { value: 1, label: 'Medium', color: 'bg-yellow-500' },
                      { value: 0, label: 'Normal', color: 'bg-gray-400' },
                    ].map((p) => (
                      <button
                        key={p.value}
                        onClick={() => togglePriority(p.value)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                          activeFilters.priorities.includes(p.value)
                            ? 'bg-blue-100 border-2 border-blue-400'
                            : 'bg-white/70 border-2 border-transparent hover:bg-gray-100'
                        }`}
                      >
                        <div className={`w-3 h-3 rounded-full ${p.color}`} />
                        <span className="text-gray-700">{p.label}</span>
                        {activeFilters.priorities.includes(p.value) && (
                          <span className="ml-auto text-blue-500">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Tag Filter */}
                {allTags.length > 0 && (
                  <section>
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Tags</h3>
                    <div className="space-y-2">
                      {allTags.map((tag) => {
                        const color = tags.get(tag) || '#999';
                        return (
                          <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                              activeFilters.tags.includes(tag)
                                ? 'bg-blue-100 border-2 border-blue-400'
                                : 'bg-white/70 border-2 border-transparent hover:bg-gray-100'
                            }`}
                          >
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                            <span className="text-gray-700">{tag}</span>
                            {activeFilters.tags.includes(tag) && (
                              <span className="ml-auto text-blue-500">✓</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* Time Filter */}
                <section>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Time Constraint</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setActiveFilters({ hasTime: activeFilters.hasTime === true ? null : true })}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                        activeFilters.hasTime === true
                          ? 'bg-blue-100 border-2 border-blue-400'
                          : 'bg-white/70 border-2 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-gray-700">Has time duration</span>
                      {activeFilters.hasTime === true && (
                        <span className="ml-auto text-blue-500">✓</span>
                      )}
                    </button>
                    <button
                      onClick={() => setActiveFilters({ hasTime: activeFilters.hasTime === false ? null : false })}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                        activeFilters.hasTime === false
                          ? 'bg-blue-100 border-2 border-blue-400'
                          : 'bg-white/70 border-2 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-gray-700">No time duration</span>
                      {activeFilters.hasTime === false && (
                        <span className="ml-auto text-blue-500">✓</span>
                      )}
                    </button>
                  </div>
                </section>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  disabled={activeFilterCount === 0}
                >
                  Clear All Filters
                </button>
                <button
                  onClick={onClose}
                  className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Apply & Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

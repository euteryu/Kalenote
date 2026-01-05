import { useEffect, useState } from 'react';
import { useStore } from './store';
import { Background } from './components/Background';
import { VoiceOverlay } from './components/VoiceOverlay';
import { SettingsModal } from './components/SettingsModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastContainer } from './components/ToastContainer';
import { KanbanBoard } from './components/Kanban/KanbanBoard';
import { CalendarView } from './components/Calendar/CalendarView';
import { TimerView } from './components/Timer/TimerView';

function App() {
  const { currentView, setCurrentView, initData, isLoading } = useStore();
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [fontSize, setFontSize] = useState(18); // Base font size in px

  useEffect(() => {
    initData().catch((err) => {
      console.error('Failed to initialize app:', err);
      setError(err.message || 'Failed to load data');
    });
  }, [initData]);

  // Dynamic font size adjustment with Ctrl+/Ctrl-
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey)) {
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          setFontSize(prev => Math.min(prev + 2, 28)); // Max 28px (+10px from default 18)
        } else if (e.key === '-' || e.key === '_') {
          e.preventDefault();
          setFontSize(prev => Math.max(prev - 2, 12)); // Min 12px (-6px from default 18)
        } else if (e.key === '0') {
          e.preventDefault();
          setFontSize(18); // Reset to default
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Apply font size to document
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Background />
        <div className="relative z-10 text-center">
          <div className="text-2xl text-red-600 mb-4">⚠️ Error</div>
          <div className="text-lg text-gray-600">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-6 py-2 bg-white/40 hover:bg-white/60 backdrop-blur-md border border-white/50 text-gray-800 rounded-lg shadow-lg transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Background />
        <div className="relative z-10 text-2xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      <Background />
      
      {/* Header */}
      <header className="relative z-10 bg-white/20 backdrop-blur-sm border-b border-white/30">
        <div className="flex items-center justify-between px-6 py-2">
          <h1 className="text-3xl font-light text-gray-800">Hi, Minseok</h1>
          
          {/* Navigation */}
          <nav className="flex gap-2">
            {[
              { id: 'kanban', label: 'Kanban', icon: '📋' },
              { id: 'calendar', label: 'Calendar', icon: '📅' },
              { id: 'timer', label: 'Timer', icon: '⏱️' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as any)}
                className={`px-6 py-2 rounded-xl transition-all ${
                  currentView === item.id
                    ? 'bg-white/50 shadow-lg backdrop-blur-md border border-white/50'
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          {/* Settings button */}
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="w-10 h-10 bg-white/40 hover:bg-white/60 backdrop-blur-md border border-white/50 rounded-full transition-all flex items-center justify-center shadow-lg hover:shadow-xl"
          >
            ⚙️
          </button>
        </div>
      </header>

      {/* Main content - wrapped in ErrorBoundary */}
      <main className="relative z-10" style={{ height: 'calc(100vh - 57px)' }}>
        <ErrorBoundary>
          {currentView === 'kanban' && <KanbanBoard />}
          {currentView === 'calendar' && <CalendarView />}
          {currentView === 'timer' && <TimerView />}
        </ErrorBoundary>
      </main>

      {/* Voice overlay - wrapped in ErrorBoundary */}
      <ErrorBoundary>
        <VoiceOverlay />
      </ErrorBoundary>

      {/* Settings modal - wrapped in ErrorBoundary */}
      <ErrorBoundary>
        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      </ErrorBoundary>

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
}

export default App;

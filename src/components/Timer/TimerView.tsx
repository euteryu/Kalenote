import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

type TimerMode = 'countdown' | 'stopwatch';

export const TimerView = () => {
  const [mode, setMode] = useState<TimerMode>('countdown');
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0); // in seconds
  const [countdownTarget, setCountdownTarget] = useState(25 * 60); // Default 25 min

  useEffect(() => {
    let interval: number;

    if (isRunning) {
      interval = setInterval(() => {
        setTime((prev) => {
          if (mode === 'countdown') {
            if (prev <= 0) {
              setIsRunning(false);
              // Play notification sound (optional)
              return 0;
            }
            return prev - 1;
          } else {
            return prev + 1;
          }
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, mode]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (mode === 'countdown' && time === 0) {
      setTime(countdownTarget);
    }
    setIsRunning(true);
  };

  const handlePause = () => setIsRunning(false);

  const handleReset = () => {
    setIsRunning(false);
    setTime(mode === 'countdown' ? countdownTarget : 0);
  };

  const progress = mode === 'countdown' ? (time / countdownTarget) * 100 : 0;
  const circumference = 2 * Math.PI * 120;

  return (
    <div className="p-6 h-full flex items-center justify-center">
      <div className="bg-white/30 backdrop-blur-md rounded-3xl p-12 border border-white/30 max-w-2xl w-full">
        {/* Mode toggle */}
        <div className="flex gap-4 mb-12 justify-center">
          <button
            onClick={() => {
              setMode('countdown');
              handleReset();
            }}
            className={`px-6 py-3 rounded-xl transition-all ${
              mode === 'countdown'
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                : 'bg-white/50 text-gray-700 hover:bg-white/70'
            }`}
          >
            Countdown
          </button>
          <button
            onClick={() => {
              setMode('stopwatch');
              handleReset();
            }}
            className={`px-6 py-3 rounded-xl transition-all ${
              mode === 'stopwatch'
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                : 'bg-white/50 text-gray-700 hover:bg-white/70'
            }`}
          >
            Stopwatch
          </button>
        </div>

        {/* Circular progress */}
        <div className="relative flex items-center justify-center mb-12">
          <svg className="transform -rotate-90" width="280" height="280">
            {/* Background circle */}
            <circle
              cx="140"
              cy="140"
              r="120"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="12"
              fill="none"
            />
            {/* Progress circle */}
            {mode === 'countdown' && (
              <motion.circle
                cx="140"
                cy="140"
                r="120"
                stroke="rgb(59, 130, 246)"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference - (progress / 100) * circumference }}
                style={{
                  strokeDasharray: circumference,
                }}
              />
            )}
          </svg>

          {/* Time display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl font-light text-gray-800 tabular-nums">
              {formatTime(time)}
            </span>
          </div>
        </div>

        {/* Countdown settings */}
        {mode === 'countdown' && !isRunning && (
          <div className="mb-8">
            <label className="block text-sm text-gray-600 mb-2">Set Duration (minutes)</label>
            <input
              type="number"
              min="1"
              max="120"
              value={countdownTarget / 60}
              onChange={(e) => {
                const mins = parseInt(e.target.value) || 25;
                setCountdownTarget(mins * 60);
                setTime(mins * 60);
              }}
              className="w-full bg-white/50 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-4 justify-center">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="px-12 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl text-lg font-medium transition-colors shadow-lg shadow-green-500/30"
            >
              Start
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="px-12 py-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-lg font-medium transition-colors shadow-lg shadow-yellow-500/30"
            >
              Pause
            </button>
          )}
          <button
            onClick={handleReset}
            className="px-12 py-4 bg-gray-500 hover:bg-gray-600 text-white rounded-xl text-lg font-medium transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const TimerView = () => {
  const [mode, setMode] = useState<'timer' | 'stopwatch'>('timer');
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // Timer state (HH:MM:SS)
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  
  // Input state - store as strings for better input control
  const [inputHours, setInputHours] = useState('00');
  const [inputMinutes, setInputMinutes] = useState('25');
  const [inputSeconds, setInputSeconds] = useState('00');
  
  // Stopwatch state
  const [stopwatchTime, setStopwatchTime] = useState(0);
  
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Timer countdown
  useEffect(() => {
    if (!isRunning || isPaused || mode !== 'timer') return;

    intervalRef.current = window.setInterval(() => {
      setSeconds((s) => {
        if (s > 0) return s - 1;
        
        setMinutes((m) => {
          if (m > 0) {
            setSeconds(59);
            return m - 1;
          }
          
          setHours((h) => {
            if (h > 0) {
              setMinutes(59);
              setSeconds(59);
              return h - 1;
            }
            
            // Timer finished
            setIsRunning(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
            playSound();
            return 0;
          });
          return 0;
        });
        return 0;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isPaused, mode]);

  // Stopwatch
  useEffect(() => {
    if (!isRunning || isPaused || mode !== 'stopwatch') return;

    startTimeRef.current = Date.now() - stopwatchTime;
    
    intervalRef.current = window.setInterval(() => {
      setStopwatchTime(Date.now() - startTimeRef.current);
    }, 10);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isPaused, mode, stopwatchTime]);

  const playSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const startTimer = () => {
    if (mode === 'timer') {
      const h = parseInt(inputHours) || 0;
      const m = parseInt(inputMinutes) || 0;
      const s = parseInt(inputSeconds) || 0;
      
      if (h === 0 && m === 0 && s === 0) return;
      
      setHours(h);
      setMinutes(m);
      setSeconds(s);
    }
    
    setIsRunning(true);
    setIsPaused(false);
  };

  const pauseTimer = () => {
    setIsPaused(true);
  };

  const resumeTimer = () => {
    setIsPaused(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    
    if (mode === 'timer') {
      setHours(parseInt(inputHours) || 0);
      setMinutes(parseInt(inputMinutes) || 0);
      setSeconds(parseInt(inputSeconds) || 0);
    } else {
      setStopwatchTime(0);
    }
  };

  const handleInputChange = (type: 'hours' | 'minutes' | 'seconds', value: string) => {
    // Allow empty string or numbers only
    if (value !== '' && !/^\d+$/.test(value)) return;
    
    // Set the raw value immediately
    if (type === 'hours') {
      setInputHours(value);
    } else if (type === 'minutes') {
      setInputMinutes(value);
    } else {
      setInputSeconds(value);
    }
  };

  const handleInputBlur = (type: 'hours' | 'minutes' | 'seconds', value: string) => {
    // Format on blur
    let numValue = parseInt(value) || 0;
    
    if (type === 'hours') {
      numValue = Math.min(numValue, 99);
      setInputHours(numValue.toString().padStart(2, '0'));
    } else {
      numValue = Math.min(numValue, 59);
      if (type === 'minutes') {
        setInputMinutes(numValue.toString().padStart(2, '0'));
      } else {
        setInputSeconds(numValue.toString().padStart(2, '0'));
      }
    }
  };

  const handleInputFocus = () => {
    // Select all on focus for easy replacement
    const input = document.activeElement as HTMLInputElement;
    if (input) {
      input.select();
    }
  };

  const formatStopwatchTime = () => {
    const totalSeconds = Math.floor(stopwatchTime / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const ms = Math.floor((stopwatchTime % 1000) / 10);
    
    return {
      hours: h.toString().padStart(2, '0'),
      minutes: m.toString().padStart(2, '0'),
      seconds: s.toString().padStart(2, '0'),
      milliseconds: ms.toString().padStart(2, '0'),
    };
  };

  const stopwatchDisplay = formatStopwatchTime();

  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      {/* Mode Switcher */}
      {!isRunning && (
        <motion.div 
          className="flex gap-2 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={() => setMode('timer')}
            className={`px-8 py-3 rounded-xl transition-all ${
              mode === 'timer'
                ? 'bg-white/50 shadow-lg backdrop-blur-md border border-white/50'
                : 'bg-white/20 hover:bg-white/30'
            }`}
          >
            ⏱️ Timer
          </button>
          <button
            onClick={() => setMode('stopwatch')}
            className={`px-8 py-3 rounded-xl transition-all ${
              mode === 'stopwatch'
                ? 'bg-white/50 shadow-lg backdrop-blur-md border border-white/50'
                : 'bg-white/20 hover:bg-white/30'
            }`}
          >
            ⏰ Stopwatch
          </button>
        </motion.div>
      )}

      {/* Timer Display / Input */}
      <AnimatePresence mode="wait">
        {!isRunning ? (
          <motion.div
            key="input"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center"
          >
            <div className="text-gray-600 text-lg mb-4">Set {mode === 'timer' ? 'Timer' : 'Stopwatch'}</div>
            
            {mode === 'timer' && (
              <div className="flex items-center gap-4 mb-8">
                {/* Hours */}
                <div className="flex flex-col items-center">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={inputHours}
                    onChange={(e) => handleInputChange('hours', e.target.value)}
                    onBlur={(e) => handleInputBlur('hours', e.target.value)}
                    onFocus={handleInputFocus}
                    className="w-24 h-24 text-5xl text-center bg-white/40 backdrop-blur-md border-2 border-white/50 rounded-2xl focus:outline-none focus:border-blue-400 transition-all shadow-lg"
                    maxLength={2}
                    placeholder="00"
                  />
                  <span className="text-sm text-gray-600 mt-2">Hours</span>
                </div>
                
                <span className="text-5xl text-gray-400">:</span>
                
                {/* Minutes */}
                <div className="flex flex-col items-center">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={inputMinutes}
                    onChange={(e) => handleInputChange('minutes', e.target.value)}
                    onBlur={(e) => handleInputBlur('minutes', e.target.value)}
                    onFocus={handleInputFocus}
                    className="w-24 h-24 text-5xl text-center bg-white/40 backdrop-blur-md border-2 border-white/50 rounded-2xl focus:outline-none focus:border-blue-400 transition-all shadow-lg"
                    maxLength={2}
                    placeholder="00"
                  />
                  <span className="text-sm text-gray-600 mt-2">Minutes</span>
                </div>
                
                <span className="text-5xl text-gray-400">:</span>
                
                {/* Seconds */}
                <div className="flex flex-col items-center">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={inputSeconds}
                    onChange={(e) => handleInputChange('seconds', e.target.value)}
                    onBlur={(e) => handleInputBlur('seconds', e.target.value)}
                    onFocus={handleInputFocus}
                    className="w-24 h-24 text-5xl text-center bg-white/40 backdrop-blur-md border-2 border-white/50 rounded-2xl focus:outline-none focus:border-blue-400 transition-all shadow-lg"
                    maxLength={2}
                    placeholder="00"
                  />
                  <span className="text-sm text-gray-600 mt-2">Seconds</span>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="running"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center"
          >
            {/* Large Time Display */}
            <motion.div 
              className="bg-white/30 backdrop-blur-xl rounded-3xl p-12 border-2 border-white/50 shadow-2xl mb-8"
              animate={isPaused ? {} : {
                boxShadow: [
                  '0 0 20px rgba(59, 130, 246, 0.3)',
                  '0 0 40px rgba(59, 130, 246, 0.5)',
                  '0 0 20px rgba(59, 130, 246, 0.3)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <div className="flex items-center gap-6">
                {mode === 'timer' ? (
                  <>
                    <motion.span 
                      className="text-9xl font-light text-gray-800 tabular-nums"
                      animate={{ scale: seconds === 0 && minutes === 0 ? [1, 1.05, 1] : 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {hours.toString().padStart(2, '0')}
                    </motion.span>
                    <span className="text-8xl text-gray-400">:</span>
                    <motion.span 
                      className="text-9xl font-light text-gray-800 tabular-nums"
                      animate={{ scale: seconds === 0 ? [1, 1.05, 1] : 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {minutes.toString().padStart(2, '0')}
                    </motion.span>
                    <span className="text-8xl text-gray-400">:</span>
                    <motion.span 
                      className="text-9xl font-light text-gray-800 tabular-nums"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      {seconds.toString().padStart(2, '0')}
                    </motion.span>
                  </>
                ) : (
                  <>
                    <span className="text-9xl font-light text-gray-800 tabular-nums">{stopwatchDisplay.hours}</span>
                    <span className="text-8xl text-gray-400">:</span>
                    <span className="text-9xl font-light text-gray-800 tabular-nums">{stopwatchDisplay.minutes}</span>
                    <span className="text-8xl text-gray-400">:</span>
                    <span className="text-9xl font-light text-gray-800 tabular-nums">{stopwatchDisplay.seconds}</span>
                    <span className="text-6xl text-gray-500">.{stopwatchDisplay.milliseconds}</span>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <motion.div 
        className="flex gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {!isRunning ? (
          <motion.button
            onClick={startTimer}
            className="px-12 py-4 bg-white/40 hover:bg-white/60 backdrop-blur-md border-2 border-white/50 rounded-2xl text-gray-800 font-medium text-lg transition-all shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ▶️ Start
          </motion.button>
        ) : (
          <>
            {isPaused ? (
              <motion.button
                onClick={resumeTimer}
                className="px-12 py-4 bg-white/40 hover:bg-white/60 backdrop-blur-md border-2 border-white/50 rounded-2xl text-gray-800 font-medium text-lg transition-all shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ▶️ Resume
              </motion.button>
            ) : (
              <motion.button
                onClick={pauseTimer}
                className="px-12 py-4 bg-white/40 hover:bg-white/60 backdrop-blur-md border-2 border-white/50 rounded-2xl text-gray-800 font-medium text-lg transition-all shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ⏸️ Pause
              </motion.button>
            )}
            <motion.button
              onClick={resetTimer}
              className="px-12 py-4 bg-white/40 hover:bg-white/60 backdrop-blur-md border-2 border-white/50 rounded-2xl text-gray-800 font-medium text-lg transition-all shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🔄 Reset
            </motion.button>
          </>
        )}
      </motion.div>
    </div>
  );
};

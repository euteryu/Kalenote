import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { useToast } from '../hooks/useToast';

export const VoiceOverlay = () => {
  const { isVoiceActive, setVoiceActive, addTask } = useStore();
  const { addToast } = useToast();
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('Speech recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript + interimTranscript);

      // Reset silence timer
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }

      // Auto-submit after 3s of silence
      silenceTimerRef.current = setTimeout(() => {
        if (finalTranscript.trim()) {
          submitVoiceNote(finalTranscript.trim());
        }
      }, 3000);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      addToast('Voice recognition error', 'error');
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, [addToast]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setVoiceActive(true);
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setVoiceActive(false);
      
      if (transcript.trim()) {
        submitVoiceNote(transcript.trim());
      }
    }
  };

  const submitVoiceNote = (text: string) => {
    addTask({
      content: text,
      status: 'inbox',
      priority: 0,
      tags: [],
    });
    addToast('Voice note added to Inbox ✓', 'success');
    setTranscript('');
    setVoiceActive(false);
  };

  // Listen for "Hey Kale" wake word (simplified - just button for now)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to activate voice
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (!isVoiceActive) {
          startListening();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVoiceActive]);

  return (
    <>
      {/* Voice button */}
      <motion.button
        onClick={isListening ? stopListening : startListening}
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-lg transition-all duration-300 ${
          isListening
            ? 'bg-red-500 hover:bg-red-600'
            : 'bg-blue-500 hover:bg-blue-600'
        }`}
        title="Voice Input (Ctrl+K)"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={isListening ? {
          boxShadow: [
            '0 0 0 0 rgba(239, 68, 68, 0.4)',
            '0 0 0 20px rgba(239, 68, 68, 0)',
          ],
        } : {}}
        transition={isListening ? {
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeOut',
        } : {}}
      >
        <motion.svg
          className="w-8 h-8 m-auto text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          animate={isListening ? { scale: [1, 1.2, 1] } : { scale: 1 }}
          transition={isListening ? { duration: 1.5, repeat: Infinity } : {}}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
          />
        </motion.svg>
      </motion.button>

      {/* Voice overlay */}
      <AnimatePresence>
        {isVoiceActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 flex items-center justify-center backdrop-blur-md bg-black/30"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/20 max-w-2xl w-full mx-4"
            >
              <div className="text-center">
                {/* Pulsing microphone */}
                <motion.div
                  className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500/30 to-red-600/30 flex items-center justify-center relative"
                  animate={{
                    scale: [1, 1.1, 1],
                    boxShadow: [
                      '0 0 20px rgba(239, 68, 68, 0.3)',
                      '0 0 40px rgba(239, 68, 68, 0.5)',
                      '0 0 20px rgba(239, 68, 68, 0.3)',
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <motion.div
                    className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center"
                    animate={{
                      scale: [1, 0.95, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <circle cx="10" cy="10" r="3" />
                    </svg>
                  </motion.div>
                  
                  {/* Ripple effect */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-red-400"
                    animate={{
                      scale: [1, 1.8, 1],
                      opacity: [0.6, 0, 0.6],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeOut',
                    }}
                  />
                </motion.div>

                <motion.h2
                  className="text-3xl font-light text-white mb-4"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Listening...
                </motion.h2>
                
                <motion.p
                  className="text-white/70 mb-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Speak your thought. I'll add it when you're done.
                </motion.p>

                {transcript && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/10 rounded-2xl p-6 mb-6 min-h-[100px]"
                  >
                    <p className="text-white text-lg leading-relaxed">{transcript}</p>
                  </motion.div>
                )}

                <motion.button
                  onClick={stopListening}
                  className="px-8 py-3 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Stop & Add Note
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

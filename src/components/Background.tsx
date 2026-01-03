import { motion } from 'framer-motion';
import { useStore } from '../store';
import { getTheme } from '../themes';

export const Background = () => {
  const { settings, isVoiceActive } = useStore();
  const theme = getTheme(settings.theme);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-gray-50">
      {theme.orbs.map((orb, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full blur-3xl opacity-40"
          style={{
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            left: `${orb.initialX}%`,
            top: `${orb.initialY}%`,
            background: `radial-gradient(circle, ${orb.colors.join(', ')})`,
          }}
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -80, 100, 0],
            scale: [1, 1.15, 0.9, 1],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Voice mode overlay orb */}
      {isVoiceActive && (
        <motion.div
          className="absolute rounded-full blur-2xl"
          style={{
            width: '600px',
            height: '600px',
            left: '50%',
            top: '50%',
            marginLeft: '-300px',
            marginTop: '-300px',
            background: 'radial-gradient(circle, #1F2937, #111827, #000000)',
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.7, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5 }}
        />
      )}
    </div>
  );
};
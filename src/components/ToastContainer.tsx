import { motion, AnimatePresence } from 'framer-motion';
import { useToast, Toast } from '../hooks/useToast';

const ToastItem = ({ toast }: { toast: Toast }) => {
  const { removeToast } = useToast();

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-500 border-green-600';
      case 'error':
        return 'bg-red-500 border-red-600';
      case 'warning':
        return 'bg-yellow-500 border-yellow-600';
      default:
        return 'bg-blue-500 border-blue-600';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      default:
        return 'ℹ';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
      className={`${getToastStyles()} text-white px-6 py-4 rounded-xl shadow-2xl border-2 flex items-center gap-3 min-w-[300px] max-w-[500px]`}
    >
      <div className="text-2xl">{getIcon()}</div>
      <div className="flex-1">
        <p className="font-medium">{toast.message}</p>
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="text-white/80 hover:text-white transition-colors"
      >
        ✕
      </button>
    </motion.div>
  );
};

export const ToastContainer = () => {
  const { toasts } = useToast();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

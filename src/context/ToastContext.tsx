import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastContextType {
  toasts: Toast[];
  showToast: (options: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
  toast: {
    success: (message: string, title?: string, duration?: number) => string;
    error: (message: string, title?: string, duration?: number) => string;
    info: (message: string, title?: string, duration?: number) => string;
    warning: (message: string, title?: string, duration?: number) => string;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const showToast = useCallback(
    (options: Omit<Toast, 'id'>): string => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const duration = options.duration ?? 4500;

      const newToast: Toast = {
        ...options,
        id,
        duration,
      };

      setToasts((prev) => [newToast, ...prev].slice(0, 5)); // Keep max 5 visible toasts

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const toastHelpers = {
    success: useCallback(
      (message: string, title?: string, duration?: number) =>
        showToast({ type: 'success', message, title: title || 'Success', duration }),
      [showToast]
    ),
    error: useCallback(
      (message: string, title?: string, duration?: number) =>
        showToast({ type: 'error', message, title: title || 'Error', duration }),
      [showToast]
    ),
    info: useCallback(
      (message: string, title?: string, duration?: number) =>
        showToast({ type: 'info', message, title: title || 'Notice', duration }),
      [showToast]
    ),
    warning: useCallback(
      (message: string, title?: string, duration?: number) =>
        showToast({ type: 'warning', message, title: title || 'Warning', duration }),
      [showToast]
    ),
  };

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        removeToast,
        clearAllToasts,
        toast: toastHelpers,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// UI Component for Toast Container & Cards
const ToastContainer: React.FC<{ toasts: Toast[]; onDismiss: (id: string) => void }> = ({
  toasts,
  onDismiss,
}) => {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastCard: React.FC<{ toast: Toast; onDismiss: () => void }> = ({ toast, onDismiss }) => {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-amber-400 shrink-0" />;
    }
  };

  const getBorderAndBg = () => {
    switch (toast.type) {
      case 'success':
        return 'border-emerald-500/30 bg-secondary text-white shadow-emerald-900/20';
      case 'error':
        return 'border-rose-500/40 bg-secondary text-white shadow-rose-900/20';
      case 'warning':
        return 'border-amber-500/40 bg-secondary text-white shadow-amber-900/20';
      case 'info':
      default:
        return 'border-primary/40 bg-secondary text-white shadow-slate-900/20';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`pointer-events-auto relative overflow-hidden rounded-2xl p-4 border shadow-xl backdrop-blur-md flex gap-3.5 items-start ${getBorderAndBg()}`}
    >
      <div className="pt-0.5">{getIcon()}</div>

      <div className="flex-1 text-left pr-2">
        {toast.title && (
          <h4 className="font-serif text-sm font-bold text-white leading-snug mb-0.5">
            {toast.title}
          </h4>
        )}
        <p className="font-sans text-xs text-slate-200 font-medium leading-relaxed">
          {toast.message}
        </p>

        {toast.action && (
          <button
            type="button"
            onClick={toast.action.onClick}
            className="mt-2 text-xs font-bold text-primary hover:underline"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={onDismiss}
        className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 shrink-0"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress timer bar */}
      {toast.duration && toast.duration > 0 && (
        <motion.div
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: toast.duration / 1000, ease: 'linear' }}
          style={{ originX: 0 }}
          className={`absolute bottom-0 left-0 right-0 h-1 ${
            toast.type === 'success'
              ? 'bg-emerald-500'
              : toast.type === 'error'
              ? 'bg-rose-500'
              : toast.type === 'warning'
              ? 'bg-amber-500'
              : 'bg-primary'
          }`}
        />
      )}
    </motion.div>
  );
};

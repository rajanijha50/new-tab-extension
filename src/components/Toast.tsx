import React from 'react';
import { useToastStore, type ToastItem } from '../store/toastStore';
import { MdClose } from 'react-icons/md';
import clsx from 'clsx';

const Toast: React.FC<{ toast: ToastItem }> = ({ toast }) => {
  const { removeToast } = useToastStore();

  const bgColors = {
    success: 'bg-accent-secondary border-accent-secondary/30 text-white',
    error: 'bg-accent-danger border-accent-danger/30 text-white',
    info: 'bg-accent-primary border-accent-primary/30 text-white',
  };

  return (
    <div
      className={clsx(
        'flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm min-w-[240px] max-w-sm backdrop-blur-md transition-all duration-300 animate-slide-in-left',
        bgColors[toast.type]
      )}
      role="alert"
    >
      <span className="font-semibold tracking-wide">{toast.message}</span>
      <button
        onClick={() => removeToast(toast.id)}
        className="p-0.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
        aria-label="Close notification"
      >
        <MdClose className="text-lg" />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts } = useToastStore();

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2.5 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;

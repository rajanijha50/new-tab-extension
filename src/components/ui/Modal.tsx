import React, { useEffect, useRef } from 'react';
import { MdClose } from 'react-icons/md';
import { GlassCard } from './GlassCard';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (overlayRef.current === e.target) {
      onClose();
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 dark:bg-black/60 backdrop-blur-[2px] animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <GlassCard className="w-full max-w-lg p-6 flex flex-col max-h-[85vh] relative shadow-2xl border-white/30 dark:border-white/10 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/15 dark:border-white/10">
          <h2 className="text-xl font-bold tracking-wide">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/15 dark:hover:bg-white/10 transition-colors cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 focus:outline-none"
            aria-label="Close modal"
          >
            <MdClose className="text-2xl" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto mt-4 scrollbar-thin pr-1">
          {children}
        </div>
      </GlassCard>
    </div>
  );
};
export default Modal;

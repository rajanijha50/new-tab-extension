import React from 'react';
import { FiPlus } from 'react-icons/fi';

interface FABProps {
  onClick: () => void;
}

export const FAB: React.FC<FABProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full glass-button active:scale-95 text-white shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/40"
      title="Add Link (+)"
    >
      <FiPlus className="w-7 h-7" />
    </button>
  );
};

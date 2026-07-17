import React from 'react';
import { MdAdd } from 'react-icons/md';

interface FABProps {
  onClick: () => void;
}

export const FAB: React.FC<FABProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center text-white bg-linear-to-br from-accent-primary via-accent-violet to-accent-rose hover:scale-110 active:scale-95 shadow-lg shadow-accent-primary/25 hover:shadow-xl hover:shadow-accent-primary/40 transition-all duration-300 cursor-pointer z-30 animate-pulse-soft"
      title="Add new link"
      aria-label="Add new link"
    >
      <MdAdd className="text-3xl transition-transform duration-200 group-hover:rotate-90" />
    </button>
  );
};

export default FAB;

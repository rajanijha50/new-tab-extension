import React from 'react';
import { MdAdd } from 'react-icons/md';

interface FABProps {
  onClick: () => void;
}

export const FAB: React.FC<FABProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center text-white bg-linear-to-r from-accent-primary to-accent-secondary hover:scale-110 active:scale-95 shadow-lg shadow-accent-primary/20 hover:shadow-xl hover:shadow-accent-primary/30 transition-all duration-200 cursor-pointer z-30"
      title="Add new link"
      aria-label="Add new link"
    >
      <MdAdd className="text-3xl" />
    </button>
  );
};

export default FAB;

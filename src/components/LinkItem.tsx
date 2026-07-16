import React from 'react';
import type { Link } from '../types/link';
import { MdEdit, MdDelete } from 'react-icons/md';

interface LinkItemProps {
  link: Link;
  onEdit: () => void;
  onDelete: () => void;
}

export const LinkItem: React.FC<LinkItemProps> = ({ link, onEdit, onDelete }) => {
  return (
    <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/20 dark:bg-white/5 border border-white/10 hover:border-white/25 hover:bg-white/30 dark:hover:bg-white/10 transition-all duration-200 group">
      <div className="flex-1 min-w-0 mr-4">
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-sm text-gray-800 dark:text-gray-100 hover:text-accent-primary dark:hover:text-accent-primary transition-colors block truncate"
        >
          {link.title || link.domain}
        </a>
        <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500 block truncate mt-0.5">
          {link.url}
        </span>
      </div>
      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="p-2 rounded-lg hover:bg-white/20 dark:hover:bg-white/10 text-gray-400 hover:text-accent-primary dark:hover:text-accent-primary transition-colors cursor-pointer"
          title="Edit link"
          aria-label="Edit link"
        >
          <MdEdit className="text-base" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded-lg hover:bg-accent-danger/25 text-gray-400 hover:text-accent-danger transition-colors cursor-pointer"
          title="Delete link"
          aria-label="Delete link"
        >
          <MdDelete className="text-base" />
        </button>
      </div>
    </div>
  );
};

export default LinkItem;

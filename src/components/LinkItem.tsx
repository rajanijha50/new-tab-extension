import React from 'react';
import type { Link } from '../types/link';
import { MdEdit, MdDelete, MdDragIndicator } from 'react-icons/md';
import LinkFormatter from '../services/formatter';
import clsx from 'clsx';

interface LinkItemProps {
  link: Link;
  onEdit: () => void;
  onDelete: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, link: Link) => void;
}

export const LinkItem: React.FC<LinkItemProps> = ({
  link,
  onEdit,
  onDelete,
  draggable = false,
  onDragStart,
}) => {
  return (
    <div
      draggable={draggable}
      onDragStart={draggable ? (e) => onDragStart?.(e, link) : undefined}
      className={clsx(
        'flex items-center justify-between p-3.5 rounded-xl bg-white/20 dark:bg-white/5 border border-white/10 dark:border-white/8 hover:border-white/25 dark:hover:border-white/15 hover:bg-white/30 dark:hover:bg-white/10 transition-all duration-200 group',
        draggable && 'cursor-grab active:cursor-grabbing'
      )}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0 mr-4">
        {draggable && (
          <MdDragIndicator className="text-gray-300 dark:text-gray-600 shrink-0 text-lg opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
        <img
          src={link.icon || LinkFormatter.getIconFromUrl(link.url)}
          alt={link.title}
          className="w-7 h-7 rounded-lg bg-white/10 p-1 border border-white/5 shrink-0"
        />
        <div className="flex-1 min-w-0">
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-sm text-gray-800 dark:text-gray-100 hover:text-accent-primary transition-colors block truncate"
          >
            {link.title || link.domain}
          </a>
          <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400 block truncate mt-0.5">
            {link.url}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="p-2 rounded-lg hover:bg-white/20 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-accent-primary transition-colors cursor-pointer"
          title="Edit link"
          aria-label="Edit link"
        >
          <MdEdit className="text-base" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded-lg hover:bg-accent-danger/25 text-gray-500 dark:text-gray-400 hover:text-accent-danger transition-colors cursor-pointer"
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

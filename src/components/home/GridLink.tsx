import React, { useState, useCallback } from 'react';
import type { Link } from '../../types/link';
import { ContextMenu } from '../ui/ContextMenu';
import LinkFormatter from '../../services/formatter';
import clsx from 'clsx';

interface GridLinkProps {
  link: Link;
  showName: boolean;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent, linkId: number) => void;
  onDropOnItem: (draggedId: number, targetId: number) => void;
  folderId?: number | null;
}

export const GridLink: React.FC<GridLinkProps> = ({
  link,
  showName,
  onOpen,
  onEdit,
  onDelete,
  onDragStart,
  onDropOnItem,
  folderId,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [isDragOver, setIsDragOver] = useState(false);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuPosition({ x: e.clientX, y: e.clientY });
    setShowMenu(true);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragOver(false), []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const draggedId = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (!isNaN(draggedId) && draggedId !== link.id) {
      onDropOnItem(draggedId, link.id!);
    }
  }, [link.id, onDropOnItem]);

  const isInFolder = folderId !== null && folderId !== undefined;

  const contextMenuItems = [
    {
      label: 'Open',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      ),
      onClick: onOpen,
    },
    {
      label: isInFolder ? 'Move to Home' : 'Move to Folder',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
          <path d="M12 15v4" />
        </svg>
      ),
      onClick: onEdit,
    },
    {
      label: 'Edit',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      ),
      onClick: onEdit,
    },
    {
      label: 'Delete',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      ),
      onClick: onDelete,
      danger: true,
    },
  ];

  const iconSrc = link.icon || LinkFormatter.getIconFromUrl(link.url);
  const displayName = link.title || link.domain;

  return (
    <div
      className="relative group"
      draggable
      onDragStart={(e) => onDragStart(e, link.id!)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onContextMenu={handleContextMenu}
    >
      <button
        onClick={onOpen}
        className={clsx(
          'flex flex-col items-center gap-1.5 w-full cursor-pointer',
          'active:scale-95 transition-transform duration-150',
          isDragOver && 'drag-over rounded-2xl'
        )}
      >
        <img
          src={iconSrc}
          alt={displayName}
          className="app-icon-img"
          loading="lazy"
        />
        {showName && (
          <span className="text-[11px] font-medium text-center leading-tight text-gray-700 dark:text-gray-300 max-w-[72px] line-clamp-2 truncate">
            {displayName}
          </span>
        )}
      </button>

      <ContextMenu
        isOpen={showMenu}
        x={menuPosition.x}
        y={menuPosition.y}
        items={contextMenuItems}
        onClose={() => setShowMenu(false)}
      />
    </div>
  );
};

export default GridLink;
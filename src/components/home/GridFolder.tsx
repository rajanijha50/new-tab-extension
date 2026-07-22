import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { Folder } from '../../types/folder';
import type { Link } from '../../types/link';
import { ContextMenu } from '../ui/ContextMenu';
import { ResizeHandle } from '../ui/ResizeHandle';
import { IconRenderer } from '../ui/IconRenderer';
import LinkFormatter from '../../services/formatter';
import clsx from 'clsx';

interface GridFolderProps {
  folder: Folder;
  links: Link[];
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent, folderId: number) => void;
  onDropOnFolder: (draggedId: number, folderId: number) => void;
  onResize?: (folderId: number, w: number, h: number) => void;
  isOpen?: boolean;
}

const CELL_SIZE = 72;
const MIN_CELLS = 1;
const MAX_CELLS = 4;

export const GridFolder: React.FC<GridFolderProps> = ({
  folder,
  links,
  onClick,
  onEdit,
  onDelete,
  onDragStart,
  onDropOnFolder,
  onResize,
}) => {
  const [showMenu, setShowMenu] = useState<{ x: number; y: number } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const folderRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0, w: 0, h: 0 });

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu({ x: e.clientX, y: e.clientY });
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
    if (!isNaN(draggedId)) {
      onDropOnFolder(draggedId, folder.id!);
    }
  }, [folder.id, onDropOnFolder]);

  const folderWidth = folder.w || 1;
  const folderHeight = folder.h || 1;

  const baseWidth = folderWidth * CELL_SIZE;
  const baseHeight = folderHeight * CELL_SIZE;

  const previewLinks = links.slice(0, folderWidth * folderHeight);
  const totalSlots = folderWidth * folderHeight;
  const itemsToShow = previewLinks.slice(0, totalSlots);

  const contextMenuItems = [
    {
      label: 'Open Folder',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
          <path d="M12 15v4" />
        </svg>
      ),
      onClick: onClick,
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
      label: 'Delete Folder',
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

  const handleResize = useCallback((width: number, height: number) => {
    const newW = Math.max(MIN_CELLS, Math.min(MAX_CELLS, Math.round(width / CELL_SIZE)));
    const newH = Math.max(MIN_CELLS, Math.min(MAX_CELLS, Math.round(height / CELL_SIZE)));
    onResize?.(folder.id!, newW, newH);
  }, [folder.id, onResize]);

  const handleResizeEnd = useCallback((width: number, height: number) => {
    setIsResizing(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    handleResize(width, height);
  }, [handleResize]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const dx = e.clientX - startPos.current.x;
      const dy = e.clientY - startPos.current.y;
      const newW = Math.max(CELL_SIZE, startPos.current.w + dx);
      const newH = Math.max(CELL_SIZE, startPos.current.h + dy);
      handleResize(newW, newH);
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, handleResize]);

  return (
    <div
      ref={folderRef}
      className="relative group"
      draggable
      onDragStart={(e) => onDragStart(e, folder.id!)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onContextMenu={handleContextMenu}
      style={{
        width: baseWidth,
        height: baseHeight,
      }}
    >
      <button
        onClick={onClick}
        className={clsx(
          'flex flex-col items-center gap-1.5 w-full h-full cursor-pointer',
          'active:scale-[0.98] transition-transform duration-150',
          isDragOver && 'drag-over rounded-2xl'
        )}
        style={{ width: baseWidth, height: baseHeight }}
      >
        <div
          className="folder-grid-preview relative overflow-hidden"
          style={{
            backgroundColor: folder.color + '22',
            width: baseWidth,
            height: baseHeight,
            borderRadius: '16px',
          }}
        >
          {itemsToShow.length > 0 ? (
            <div
              className="grid gap-[4px] p-[4px]"
              style={{
                gridTemplateColumns: `repeat(${folderWidth}, 1fr)`,
                gridTemplateRows: `repeat(${folderHeight}, 1fr)`,
                width: '100%',
                height: '100%',
              }}
            >
              {itemsToShow.map((link) => (
                <div key={link.id} className="relative overflow-hidden rounded-[4px] bg-white/10 dark:bg-white/5">
                  <img
                    src={link.icon || LinkFormatter.getIconFromUrl(link.url)}
                    alt={link.title || link.domain}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
              {totalSlots > itemsToShow.length && (
                <>
                  {Array.from({ length: totalSlots - itemsToShow.length }).map((_, i) => (
                    <div key={`empty-${i}`} className="rounded-[4px] bg-white/5 dark:bg-white/10" />
                  ))}
                </>
              )}
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <IconRenderer name={folder.icon || 'MdFolder'} className="text-2xl" style={{ color: folder.color }} />
            </div>
          )}
          {isDragOver && (
            <div className="absolute inset-0 bg-accent-primary/20 rounded-2xl pointer-events-none" />
          )}
        </div>
        <span className="text-[11px] font-medium text-center leading-tight text-gray-700 dark:text-gray-300 max-w-full truncate px-1">
          {folder.name}
        </span>
      </button>

      <ResizeHandle
        initialWidth={baseWidth}
        initialHeight={baseHeight}
        minWidth={CELL_SIZE}
        minHeight={CELL_SIZE}
        maxWidth={MAX_CELLS * CELL_SIZE}
        maxHeight={MAX_CELLS * CELL_SIZE}
        onResize={handleResize}
        onResizeEnd={handleResizeEnd}
      />

      <ContextMenu
        isOpen={!!showMenu}
        x={showMenu?.x || 0}
        y={showMenu?.y || 0}
        items={contextMenuItems}
        onClose={() => setShowMenu(null)}
      />
    </div>
  );
};

export default GridFolder;
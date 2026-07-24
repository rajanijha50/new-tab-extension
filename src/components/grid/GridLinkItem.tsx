import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FiMoreVertical, FiEdit2, FiTrash2, FiGlobe, FiFolderPlus } from 'react-icons/fi';
import type { LinkItem } from '../../types/grid';
import { useGridStore } from '../../store/gridStore';
import { useSettingsStore } from '../../store/settingsStore';

interface GridLinkItemProps {
  link: LinkItem;
  isMergeTarget?: boolean;
}

export const GridLinkItem: React.FC<GridLinkItemProps> = ({ link, isMergeTarget = false }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: link.id,
    data: { item: link },
  });

  const { deleteItem, updateItemTitle } = useGridStore();
  const { settings } = useSettingsStore();

  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(link.title);
  const [imgError, setImgError] = useState(false);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const handleOpenLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isEditing || showMenu) return;
    window.open(link.url, '_blank');
  };

  const handleSaveTitle = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (editTitle.trim()) {
      updateItemTitle(link.id, editTitle.trim());
    }
    setIsEditing(false);
    setShowMenu(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleOpenLink}
      className={`relative group flex flex-col items-center justify-center p-2 rounded-2xl glass-panel cursor-pointer select-none w-22 h-24 touch-none transition-all hover:scale-105 ${
        isMergeTarget
          ? 'ring-4 ring-blue-500 ring-offset-2 scale-110 shadow-[0_0_25px_rgba(59,130,246,0.6)] bg-blue-500/20 z-30'
          : ''
      }`}
    >
      {/* Defined Merge Radius Visual Badge */}
      {isMergeTarget && (
        <div className="absolute -top-3 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-lg flex items-center gap-1 z-40 animate-bounce">
          <FiFolderPlus className="w-3 h-3" /> Create Folder
        </div>
      )}

      {/* Context Action Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-opacity"
      >
        <FiMoreVertical className="w-3.5 h-3.5" />
      </button>

      {/* Context Dropdown Menu */}
      {showMenu && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-7 right-1 z-30 w-32 glass-card p-1 shadow-xl border border-white/20 animate-scale-in"
        >
          <button
            onClick={() => {
              setIsEditing(true);
              setShowMenu(false);
            }}
            className="w-full text-left px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-white/40 dark:hover:bg-slate-700/50 rounded-lg flex items-center gap-2"
          >
            <FiEdit2 className="w-3.5 h-3.5 text-blue-500" /> Edit Title
          </button>
          <button
            onClick={() => {
              deleteItem(link.id);
              setShowMenu(false);
            }}
            className="w-full text-left px-2.5 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-lg flex items-center gap-2"
          >
            <FiTrash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      )}

      {/* Favicon Icon Container */}
      <div className="rounded-xl flex items-center justify-center bg-white/70 dark:bg-slate-800/70 shadow-sm border border-white/20 mb-1.5 overflow-hidden">
        {link.faviconUrl && !imgError ? (
          <img
            src={link.faviconUrl}
            alt={link.title}
            onError={() => setImgError(true)}
            className="w-7 h-7 object-contain"
          />
        ) : (
          <FiGlobe className="w-6 h-6 text-blue-500" />
        )}
      </div>

      {/* Title */}
      {isEditing ? (
        <form onSubmit={handleSaveTitle} onClick={(e) => e.stopPropagation()} className="w-full px-1">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSaveTitle}
            autoFocus
            className="w-full text-[11px] text-center bg-white/80 dark:bg-slate-900/80 border border-blue-500 rounded px-1 text-slate-800 dark:text-slate-100 focus:outline-none"
          />
        </form>
      ) : (
        settings.showLinkName && (
          <span className="text-[11px] font-medium text-slate-700 dark:text-slate-200 text-center truncate max-w-full px-1">
            {link.title}
          </span>
        )
      )}
    </div>
  );
};

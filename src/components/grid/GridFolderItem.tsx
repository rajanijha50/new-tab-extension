import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FiMoreVertical, FiEdit2, FiTrash2, FiFolder, FiGlobe, FiFolderPlus } from 'react-icons/fi';
import type { FolderItem } from '../../types/grid';
import { useGridStore } from '../../store/gridStore';
import { useSettingsStore } from '../../store/settingsStore';

interface GridFolderItemProps {
  folder: FolderItem;
  onOpenFolder: (folder: FolderItem) => void;
  isMergeTarget?: boolean;
}

export const GridFolderItem: React.FC<GridFolderItemProps> = ({ folder, onOpenFolder, isMergeTarget = false }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: folder.id,
    data: { item: folder },
  });

  const { deleteFolderSafely, updateItemTitle } = useGridStore();
  const { settings } = useSettingsStore();

  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(folder.title);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const handleSaveTitle = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (editTitle.trim()) {
      updateItemTitle(folder.id, editTitle.trim());
    }
    setIsEditing(false);
    setShowMenu(false);
  };

  const previewChildren = folder.children.slice(0, 4);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => {
        if (!isEditing && !showMenu) onOpenFolder(folder);
      }}
      className={`relative group flex flex-col items-center justify-center p-2 rounded-2xl glass-card cursor-pointer select-none w-22 h-24 touch-none transition-all hover:scale-105 ${
        isMergeTarget
          ? 'ring-4 ring-purple-500 ring-offset-2 scale-110 shadow-[0_0_25px_rgba(168,85,247,0.6)] bg-purple-500/20 z-30'
          : ''
      }`}
    >
      {/* Defined Merge Radius Visual Badge */}
      {isMergeTarget && (
        <div className="absolute -top-3 bg-purple-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-lg flex items-center gap-1 z-40 animate-bounce">
          <FiFolderPlus className="w-3 h-3" /> Add to Folder
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
          className="absolute top-7 right-1 z-30 w-36 glass-panel p-1 shadow-xl border border-white/20 animate-scale-in"
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
              deleteFolderSafely(folder.id);
              setShowMenu(false);
            }}
            className="w-full text-left px-2.5 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-lg flex items-center gap-2"
            title="Safely restores nested links back to grid"
          >
            <FiTrash2 className="w-3.5 h-3.5" /> Safe Delete
          </button>
        </div>
      )}

      {/* Folder Thumbnail Preview */}
      <div className="w-12 h-12 rounded-xl bg-white/50 dark:bg-slate-800/60 shadow-sm border border-white/20 p-1.5 mb-1.5 flex items-center justify-center">
        {previewChildren.length > 0 ? (
          <div className="grid grid-cols-2 gap-1 w-full h-full">
            {previewChildren.map((child) => (
              <div key={child.id} className="w-full h-full flex items-center justify-center overflow-hidden rounded">
                {child.faviconUrl ? (
                  <img src={child.faviconUrl} alt="" className="w-3.5 h-3.5 object-contain" />
                ) : (
                  <FiGlobe className="w-3 h-3 text-blue-400" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <FiFolder className="w-6 h-6 text-purple-500" />
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
            className="w-full text-[11px] text-center bg-white/80 dark:bg-slate-900/80 border border-purple-500 rounded px-1 text-slate-800 dark:text-slate-100 focus:outline-none"
          />
        </form>
      ) : (
        settings.showLinkName && (
          <span className="text-[11px] font-medium text-slate-700 dark:text-slate-200 text-center truncate max-w-full px-1">
            {folder.title}
          </span>
        )
      )}
    </div>
  );
};

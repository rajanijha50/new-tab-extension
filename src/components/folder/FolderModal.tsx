import React, { useState } from 'react';
import { FiFolder, FiX, FiTrash2, FiEdit2 } from 'react-icons/fi';
import type { FolderItem } from '../../types/grid';
import { useGridStore } from '../../store/gridStore';
import { FolderGrid } from './FolderGrid';

interface FolderModalProps {
  folder: FolderItem | null;
  onClose: () => void;
}

export const FolderModal: React.FC<FolderModalProps> = ({ folder, onClose }) => {
  const { deleteFolderSafely, updateItemTitle } = useGridStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(folder?.title || '');

  if (!folder) return null;

  const handleSaveTitle = (e: React.FormEvent) => {
    e.preventDefault();
    if (editTitle.trim()) {
      updateItemTitle(folder.id, editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleDeleteFolder = async () => {
    await deleteFolderSafely(folder.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm glass-panel p-6 shadow-2xl relative border border-white/20 flex flex-col items-center">
        {/* Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-slate-200/30 dark:border-slate-700/40 mb-4">
          <div className="flex items-center gap-2 flex-1 mr-2">
            <FiFolder className="w-5 h-5 text-purple-500 shrink-0" />
            {isEditing ? (
              <form onSubmit={handleSaveTitle} className="flex-1">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={handleSaveTitle}
                  autoFocus
                  className="w-full text-sm font-bold bg-white/70 dark:bg-slate-900/70 border border-purple-500 rounded px-2 py-0.5 text-slate-800 dark:text-slate-100 focus:outline-none"
                />
              </form>
            ) : (
              <h2
                onClick={() => setIsEditing(true)}
                className="text-base font-bold text-slate-800 dark:text-slate-100 truncate cursor-pointer hover:underline flex items-center gap-1.5"
                title="Click to rename"
              >
                {folder.title}
                <FiEdit2 className="w-3 h-3 text-slate-400 opacity-60" />
              </h2>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleDeleteFolder}
              className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors"
              title="Delete folder shell safely (restores nested links)"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3x3 Folder Grid Content */}
        <FolderGrid folder={folder} />
      </div>
    </div>
  );
};

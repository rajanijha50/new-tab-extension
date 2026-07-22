import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { GlassInput } from '../ui/GlassInput';
import { GlassButton } from '../ui/GlassButton';
import { useFoldersStore } from '../../store/foldersStore';
import { useToastStore } from '../../store/toastStore';
import type { Folder } from '../../types/folder';

interface EditFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folder: Folder;
}

const FOLDER_COLORS = [
  '#3b82f6', '#10b981', '#8b5cf6', '#ec4899',
  '#f59e0b', '#ef4444', '#06b6d4', '#f97316',
];

export const EditFolderModal: React.FC<EditFolderModalProps> = ({
  isOpen,
  onClose,
  folder,
}) => {
  const { updateFolder } = useFoldersStore();
  const { showToast } = useToastStore();

  const [name, setName] = useState(folder.name);
  const [color, setColor] = useState(folder.color);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (folder) {
      setName(folder.name);
      setColor(folder.color);
    }
  }, [folder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Folder name is required', 'error');
      return;
    }

    setLoading(true);
    try {
      await updateFolder(folder.id!, { name: name.trim(), color });
      showToast('Folder updated', 'success');
      onClose();
    } catch {
      showToast('Failed to update folder', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Folder">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">
            Folder Name
          </label>
          <GlassInput
            type="text"
            placeholder="e.g. Social, Work"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">
            Color
          </label>
          <div className="flex gap-2 flex-wrap">
            {FOLDER_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-xl transition-all duration-200 cursor-pointer ${
                  color === c ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 scale-110' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: c, boxShadow: color === c ? `0 0 0 2px ${c}` : undefined }}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-2">
          <GlassButton type="button" onClick={onClose}>
            Cancel
          </GlassButton>
          <GlassButton type="submit" variant="primary" loading={loading}>
            Save
          </GlassButton>
        </div>
      </form>
    </Modal>
  );
};

export default EditFolderModal;

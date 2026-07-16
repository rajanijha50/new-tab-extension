import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { GlassInput } from '../ui/GlassInput';
import { GlassButton } from '../ui/GlassButton';
import { useCategoriesStore } from '../../store/categoriesStore';
import { useToastStore } from '../../store/toastStore';
import { categorizer } from '../../services/categorizer';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addCustomCategory } = useCategoriesStore();
  const { showToast } = useToastStore();

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🔗');
  const [color, setColor] = useState('#6b7280');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Category name is required', 'error');
      return;
    }

    setLoading(true);
    try {
      const cleanName = name.trim();
      const cleanIcon = icon.trim() || '🔗';
      
      if (categorizer.exists(cleanName)) {
        showToast(`Category "${cleanName}" already exists.`, 'error');
        setLoading(false);
        return;
      }

      addCustomCategory(cleanName, cleanIcon, color);
      showToast(`Category "${cleanName}" created successfully`, 'success');
      
      setName('');
      setIcon('🔗');
      setColor('#6b7280');
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to create category', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Custom Category">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">
            Category Name *
          </label>
          <GlassInput
            type="text"
            placeholder="e.g. Design, Games"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">
              Icon Emoji (Max 2 chars)
            </label>
            <GlassInput
              type="text"
              placeholder="e.g. 🎨"
              value={icon}
              onChange={(e) => setIcon(e.target.value.substring(0, 2))}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">
              Theme Color
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-10 rounded-xl border border-white/20 dark:border-white/10 bg-transparent p-0 cursor-pointer outline-none focus:ring-2 focus:ring-accent-primary/50"
              />
              <GlassInput
                type="text"
                placeholder="#ffffff"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="font-mono text-xs uppercase"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <GlassButton type="button" onClick={onClose}>
            Cancel
          </GlassButton>
          <GlassButton type="submit" variant="primary" loading={loading}>
            Create Category
          </GlassButton>
        </div>
      </form>
    </Modal>
  );
};

export default AddCategoryModal;

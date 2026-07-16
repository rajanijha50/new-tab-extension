import React, { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { GlassInput, GlassSelect } from '../ui/GlassInput';
import { GlassButton } from '../ui/GlassButton';
import { useLinksStore } from '../../store/linksStore';
import { useCategoriesStore } from '../../store/categoriesStore';
import { useToastStore } from '../../store/toastStore';
import type { Link } from '../../types/link';

interface EditLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  link: Link | null;
}

export const EditLinkModal: React.FC<EditLinkModalProps> = ({
  isOpen,
  onClose,
  link,
}) => {
  const { updateLink } = useLinksStore();
  const { categories } = useCategoriesStore();
  const { showToast } = useToastStore();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (link) {
      setTitle(link.title || '');
      setCategory(link.category || 'other');
    }
  }, [link]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!link || !link.id) return;

    setLoading(true);
    try {
      await updateLink(link.id, {
        title: title.trim() || link.domain,
        category: category,
      });

      showToast('Link updated successfully', 'success');
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to update link', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Link">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {link && <input type="hidden" value={link.id} />}
        
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">
            URL (Read-Only)
          </label>
          <div className="glass px-4 py-2.5 rounded-xl border border-white/10 text-xs text-gray-500 truncate select-all">
            {link?.url}
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">
            Title
          </label>
          <GlassInput
            type="text"
            placeholder="e.g. GitHub"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">
            Category
          </label>
          <GlassSelect
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {Object.keys(categories).map((catName) => (
              <option key={catName} value={catName}>
                {catName
                  .split('-')
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(' ')}
              </option>
            ))}
          </GlassSelect>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <GlassButton type="button" onClick={onClose}>
            Cancel
          </GlassButton>
          <GlassButton type="submit" variant="primary" loading={loading}>
            Save Changes
          </GlassButton>
        </div>
      </form>
    </Modal>
  );
};

export default EditLinkModal;

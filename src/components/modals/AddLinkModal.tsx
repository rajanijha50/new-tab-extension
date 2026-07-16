import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { GlassInput, GlassSelect } from '../ui/GlassInput';
import { GlassButton } from '../ui/GlassButton';
import { useLinksStore } from '../../store/linksStore';
import { useCategoriesStore } from '../../store/categoriesStore';
import { useToastStore } from '../../store/toastStore';
import { categorizer } from '../../services/categorizer';
import LinkFormatter from '../../services/formatter';

interface AddLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddLinkModal: React.FC<AddLinkModalProps> = ({ isOpen, onClose }) => {
  const { addLink } = useLinksStore();
  const { categories } = useCategoriesStore();
  const { showToast } = useToastStore();

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [category, setCategory] = useState('auto-detect');
  const [loading, setLoading] = useState(false);

  const handleUrlBlur = async () => {
    let normalizedUrl = url.trim();
    if (!normalizedUrl) return;

    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    setLoading(true);
    try {
      const metadata = await LinkFormatter.fetchMetadata(normalizedUrl);
      if (metadata.title && !title.trim()) {
        setTitle(metadata.title);
      }
      if (metadata.description && !description.trim()) {
        setDescription(metadata.description);
      }
      if (metadata.icon) {
        setIcon(metadata.icon);
      }
    } catch (err) {
      console.error('Failed to auto-fetch metadata:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      showToast('URL is required', 'error');
      return;
    }

    setLoading(true);
    try {
      let normalizedUrl = url.trim();
      if (!/^https?:\/\//i.test(normalizedUrl)) {
        normalizedUrl = 'https://' + normalizedUrl;
      }

      const domain = categorizer.getDomain(normalizedUrl);
      let selectedCategory = category;
      if (selectedCategory === 'auto-detect') {
        selectedCategory = categorizer.categorize(normalizedUrl);
      }

      let finalTitle = title.trim();
      let finalIcon = icon.trim();
      let finalDesc = description.trim();

      if (!finalTitle || !finalIcon) {
        const metadata = await LinkFormatter.fetchMetadata(normalizedUrl);
        if (!finalTitle) finalTitle = metadata.title || domain;
        if (!finalIcon) finalIcon = metadata.icon;
        if (!finalDesc) finalDesc = metadata.description;
      }

      await addLink({
        url: normalizedUrl,
        title: finalTitle || domain,
        domain,
        category: selectedCategory,
        timestamp: Date.now(),
        icon: finalIcon || LinkFormatter.getIconFromUrl(normalizedUrl),
        description: finalDesc,
      });

      showToast('Link added successfully', 'success');
      setUrl('');
      setTitle('');
      setDescription('');
      setIcon('');
      setCategory('auto-detect');
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to add link', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Link">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">
            URL *
          </label>
          <GlassInput
            type="text"
            placeholder="e.g. github.com/facebook"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onBlur={handleUrlBlur}
            required
            autoFocus
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">
            Title (Optional)
          </label>
          <GlassInput
            type="text"
            placeholder="e.g. GitHub"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">
            Description (Optional)
          </label>
          <GlassInput
            type="text"
            placeholder="e.g. A premium dashboard extension"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
            <option value="auto-detect">✨ Auto-detect</option>
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
            Save Link
          </GlassButton>
        </div>
      </form>
    </Modal>
  );
};

export default AddLinkModal;

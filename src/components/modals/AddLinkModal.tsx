import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { GlassInput } from '../ui/GlassInput';
import { GlassButton } from '../ui/GlassButton';
import { useLinksStore } from '../../store/linksStore';
import { useToastStore } from '../../store/toastStore';
import LinkFormatter from '../../services/formatter';

interface AddLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddLinkModal: React.FC<AddLinkModalProps> = ({ isOpen, onClose }) => {
  const { links, addLink } = useLinksStore();
  const { showToast } = useToastStore();

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
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

      const domain = new URL(normalizedUrl).hostname.replace(/^www\./i, '');

      let finalTitle = title.trim();
      let finalIcon = icon.trim();
      let finalDesc = description.trim();

      if (!finalTitle || !finalIcon) {
        const metadata = await LinkFormatter.fetchMetadata(normalizedUrl);
        if (!finalTitle) finalTitle = metadata.title || domain;
        if (!finalIcon) finalIcon = metadata.icon;
        if (!finalDesc) finalDesc = metadata.description;
      }

      // Calculate position: find next available grid cell
      const maxX = links.reduce((max, l) => (l.folderId === null && l.x > max ? l.x : max), -1);
      const nextX = maxX + 1;
      const cols = Math.floor(520 / 98); // approximate columns
      const x = nextX % cols;
      const y = Math.floor(nextX / cols);

      await addLink({
        url: normalizedUrl,
        title: finalTitle || domain,
        domain,
        timestamp: Date.now(),
        icon: finalIcon || LinkFormatter.getIconFromUrl(normalizedUrl),
        description: finalDesc,
        folderId: null,
        x,
        y,
        w: 1,
        h: 1,
      });

      showToast('Link added!', 'success');
      setUrl('');
      setTitle('');
      setDescription('');
      setIcon('');
      onClose();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to add link', 'error');
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
            placeholder="e.g. github.com"
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
            placeholder="Auto-fetched from URL"
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
            placeholder="Brief description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-xs text-accent-primary">
            <div className="w-3 h-3 border-2 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin" />
            Fetching metadata...
          </div>
        )}

        <div className="flex justify-end gap-3 mt-2">
          <GlassButton type="button" onClick={onClose}>
            Cancel
          </GlassButton>
          <GlassButton type="submit" variant="primary" loading={loading}>
            Add Link
          </GlassButton>
        </div>
      </form>
    </Modal>
  );
};

export default AddLinkModal;

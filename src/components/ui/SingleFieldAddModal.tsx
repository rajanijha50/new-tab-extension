import React, { useState } from 'react';
import { FiX, FiLink } from 'react-icons/fi';
import { fetchUrlMetadata } from '../../services/metadata';
import { useGridStore } from '../../store/gridStore';

interface SingleFieldAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SingleFieldAddModal: React.FC<SingleFieldAddModalProps> = ({ isOpen, onClose }) => {
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addLink } = useGridStore();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsLoading(true);
    try {
      const metadata = await fetchUrlMetadata(urlInput.trim());
      await addLink({
        title: metadata.title,
        url: metadata.url,
        faviconUrl: metadata.faviconUrl,
      });
      setUrlInput('');
      onClose();
    } catch {
      // Fallback if parsing fails
      await addLink({
        title: urlInput.trim(),
        url: urlInput.trim().startsWith('http') ? urlInput.trim() : `https://${urlInput.trim()}`,
        faviconUrl: '',
      });
      setUrlInput('');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md glass-panel p-6 shadow-2xl relative border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/30 dark:border-slate-700/40 mb-4">
          <div className="flex items-center gap-2">
            <FiLink className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Add New Link</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Single-field form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Website URL
            </label>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste URL (e.g., github.com)"
              autoFocus
              className="w-full px-4 py-2.5 text-sm bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100 placeholder-slate-400"
            />
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              Title and high-res favicon will be automatically fetched and cleaned.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || !urlInput.trim()}
            className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 active:scale-[0.98] disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
          >
            {isLoading ? 'Fetching Metadata...' : 'Add Link'}
          </button>
        </form>
      </div>
    </div>
  );
};

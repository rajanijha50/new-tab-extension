import React, { useState } from 'react';
import { FiSettings, FiX, FiUploadCloud, FiSliders, FiImage, FiMoon, FiSun, FiBookmark } from 'react-icons/fi';
import { useSettingsStore } from '../../store/settingsStore';
import { useGridStore } from '../../store/gridStore';
import { getBrowserBookmarks, convertBookmarksToGridItems } from '../../services/bookmarkImporter';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, setGlassBlur, setGlassOpacity, setWallpaper, setTheme, toggleShowLinkName } = useSettingsStore();
  const { setItems } = useGridStore();
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleBookmarkImport = async () => {
    try {
      setImportStatus('Fetching bookmarks...');
      const rawBookmarks = await getBrowserBookmarks();
      if (!rawBookmarks || rawBookmarks.length === 0) {
        setImportStatus('No browser bookmarks found or permission denied.');
        return;
      }

      const importedGridItems = convertBookmarksToGridItems(rawBookmarks);
      if (importedGridItems.length === 0) {
        setImportStatus('No bookmarks found to import.');
        return;
      }

      await setItems(importedGridItems);
      setImportStatus(`Successfully imported ${importedGridItems.length} bookmark items to your grid!`);
    } catch {
      setImportStatus('Failed to import bookmarks.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg glass-panel p-6 shadow-2xl relative border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/30 dark:border-slate-700/40 mb-5">
          <div className="flex items-center gap-2.5">
            <FiSettings className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Dashboard Control Panel</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 max-h-[70vh] overflow-y-auto scrollbar-thin pr-1">
          {/* Glassmorphic Aesthetic Controls */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-3">
              <FiSliders className="text-blue-500" /> Glassmorphic Blur & Opacity
            </h3>
            
            <div className="space-y-4 bg-white/30 dark:bg-slate-900/30 p-4 rounded-2xl border border-white/10">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  <span>Backdrop Blur</span>
                  <span>{settings.glassBlur}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={settings.glassBlur}
                  onChange={(e) => setGlassBlur(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  <span>Card Opacity</span>
                  <span>{Math.round(settings.glassOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={settings.glassOpacity}
                  onChange={(e) => setGlassOpacity(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Show Link Titles</span>
                <button
                  onClick={toggleShowLinkName}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    settings.showLinkName ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      settings.showLinkName ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Theme & Wallpaper Settings */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-3">
              <FiImage className="text-purple-500" /> Theme & Wallpaper
            </h3>

            <div className="space-y-4 bg-white/30 dark:bg-slate-900/30 p-4 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Color Mode</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setTheme('light')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-xl flex items-center gap-1 transition-colors ${
                      settings.theme === 'light' ? 'bg-blue-500 text-white' : 'glass-button text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <FiSun className="w-3.5 h-3.5" /> Light
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-xl flex items-center gap-1 transition-colors ${
                      settings.theme === 'dark' ? 'bg-blue-500 text-white' : 'glass-button text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <FiMoon className="w-3.5 h-3.5" /> Dark
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Wallpaper Image URL
                </label>
                <input
                  type="text"
                  value={settings.wallpaper || ''}
                  onChange={(e) => setWallpaper(e.target.value || null)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3 py-2 text-xs bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* 1-Click Bookmark Import */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-3">
              <FiBookmark className="text-emerald-500" /> Bookmark Import
            </h3>

            <div className="bg-white/30 dark:bg-slate-900/30 p-4 rounded-2xl border border-white/10">
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                Import your browser's bookmarks tree directly into the paged grid dashboard.
              </p>
              <button
                onClick={handleBookmarkImport}
                className="glass-button w-full py-2.5 px-4 text-xs font-semibold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-2 hover:bg-blue-500 hover:text-white transition-all shadow-sm"
              >
                <FiUploadCloud className="w-4 h-4" /> 1-Click Import Bookmarks
              </button>
              {importStatus && (
                <p className="text-xs text-blue-500 font-medium mt-2 text-center animate-fade-in">
                  {importStatus}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

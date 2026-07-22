import React, { useEffect, useState, useRef } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { useGridStore } from '../store/gridStore';
import { useToastStore } from '../store/toastStore';
import { storage } from '../services/storage';
import { getBrowserBookmarks, convertBookmarksToGridItems } from '../services/bookmarkImporter';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { ToastContainer } from '../components/Toast';
import {
  MdSettings, MdPalette, MdBookmark, MdStorage, MdInfo,
  MdFileDownload, MdFileUpload, MdDelete
} from 'react-icons/md';
import { FiSun, FiMoon, FiSliders } from 'react-icons/fi';

type Section = 'general' | 'appearance' | 'bookmarks' | 'about';

const NAV_ITEMS: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: 'general', label: 'General', icon: <MdSettings /> },
  { id: 'appearance', label: 'Appearance', icon: <MdPalette /> },
  { id: 'bookmarks', label: 'Bookmarks & Data', icon: <MdBookmark /> },
  { id: 'about', label: 'About', icon: <MdInfo /> },
];

export const OptionsApp: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>('general');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { settings, loadSettings, setGlassBlur, setGlassOpacity, setWallpaper, setTheme, toggleShowLinkName } = useSettingsStore();
  const { loadItems, setItems } = useGridStore();
  const { showToast } = useToastStore();

  useEffect(() => {
    loadSettings();
    loadItems();
  }, [loadSettings, loadItems]);

  const handleExport = async () => {
    try {
      const data = await storage.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prodx-dashboard-backup-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Data exported successfully', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Export failed', 'error');
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        const result = await storage.importData(data);
        await loadItems();
        loadSettings();
        showToast(`Imported ${result.linksImported} grid items successfully`, 'success');
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Import failed', 'error');
      }
    };
    input.click();
  };

  const handleBookmarkImport = async () => {
    try {
      setImportStatus('Requesting browser permission & fetching bookmarks...');
      const rawBookmarks = await getBrowserBookmarks();
      if (!rawBookmarks || rawBookmarks.length === 0) {
        setImportStatus('No browser bookmarks found or permission denied.');
        showToast('No bookmarks found', 'info');
        return;
      }

      const importedGridItems = convertBookmarksToGridItems(rawBookmarks);
      if (importedGridItems.length === 0) {
        setImportStatus('No bookmarks found to import.');
        return;
      }

      await setItems(importedGridItems);
      setImportStatus(`Successfully imported ${importedGridItems.length} bookmark items to your grid!`);
      showToast(`Imported ${importedGridItems.length} bookmarks`, 'success');
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Failed to import bookmarks.';
      setImportStatus(errMsg);
      showToast(errMsg, 'error');
    }
  };

  const handleReset = async () => {
    if (window.confirm('Are you sure? This will delete ALL links, folders, and reset all settings.')) {
      await storage.reset();
      await loadItems();
      loadSettings();
      showToast('All data has been reset', 'info');
    }
  };

  const handleWallpaper = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('Wallpaper must be smaller than 5MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setWallpaper(reader.result as string);
      showToast('Wallpaper updated', 'success');
    };
    reader.readAsDataURL(file);
  };

  const ToggleSwitch: React.FC<{ enabled: boolean; onToggle: () => void }> = ({ enabled, onToggle }) => (
    <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer ${
        enabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <div
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
          enabled ? 'translate-x-[22px]' : 'translate-x-0.5'
        }`}
      />
    </button>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'general':
        return (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">General Settings</h2>
            <GlassCard className="flex flex-col gap-5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Color Mode</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setTheme('light')}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border flex items-center gap-2 transition-all cursor-pointer ${
                      settings.theme === 'light'
                        ? 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/25'
                        : 'glass border-white/20 dark:border-white/10 hover:border-blue-500/40 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <FiSun /> Light
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border flex items-center gap-2 transition-all cursor-pointer ${
                      settings.theme === 'dark'
                        ? 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/25'
                        : 'glass border-white/20 dark:border-white/10 hover:border-blue-500/40 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <FiMoon /> Dark
                  </button>
                  <button
                    onClick={() => setTheme('auto')}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border flex items-center gap-2 transition-all cursor-pointer ${
                      settings.theme === 'auto'
                        ? 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/25'
                        : 'glass border-white/20 dark:border-white/10 hover:border-blue-500/40 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <FiSliders /> Auto
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Link Title Display</label>
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/10 dark:bg-white/5 border border-white/10">
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Show link titles</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Toggle text titles below grid app cards</p>
                  </div>
                  <ToggleSwitch enabled={settings.showLinkName} onToggle={toggleShowLinkName} />
                </div>
              </div>
            </GlassCard>
          </div>
        );

      case 'appearance':
        return (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Appearance & Customization</h2>
            <GlassCard className="flex flex-col gap-5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                  Glass Blur — {settings.glassBlur}px
                </label>
                <input
                  type="range"
                  min={0}
                  max={40}
                  value={settings.glassBlur}
                  onChange={(e) => setGlassBlur(parseInt(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                  Glass Card Opacity — {Math.round(settings.glassOpacity * 100)}%
                </label>
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={Math.round(settings.glassOpacity * 100)}
                  onChange={(e) => setGlassOpacity(parseInt(e.target.value) / 100)}
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Live Preview</label>
                <div className="glass-panel p-6 text-center text-sm font-semibold text-slate-700 dark:text-slate-200 border border-white/25 dark:border-white/10 rounded-2xl">
                  Sample Glassmorphic Card Preview
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Custom Background Wallpaper</label>
                <div className="flex flex-wrap items-center gap-3">
                  {settings.wallpaper && (
                    <div
                      className="w-20 h-12 rounded-xl bg-cover bg-center border border-white/20 shadow-sm"
                      style={{ backgroundImage: `url(${settings.wallpaper})` }}
                    />
                  )}
                  <div>
                    <GlassButton type="button" icon={<MdFileUpload />} onClick={() => fileInputRef.current?.click()}>
                      Upload Image
                    </GlassButton>
                    <input ref={fileInputRef} type="file" accept="image/*" className="sr-only" onChange={handleWallpaper} />
                  </div>
                  {settings.wallpaper && (
                    <GlassButton variant="danger" onClick={() => { setWallpaper(null); showToast('Wallpaper cleared', 'info'); }}>
                      Clear Wallpaper
                    </GlassButton>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2">Upload a local image or clear current wallpaper.</p>
              </div>
            </GlassCard>
          </div>
        );

      case 'bookmarks':
        return (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Bookmarks & Data Management</h2>
            
            {/* 1-Click Browser Bookmark Import */}
            <GlassCard className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <MdBookmark className="w-5 h-5 text-emerald-500" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">1-Click Browser Bookmark Import</h3>
              </div>
              <p className="text-xs text-gray-400">
                Import your browser's existing bookmarks tree directly into your dashboard 3x4 grid slots. Requests browser permission dynamically if needed.
              </p>
              <GlassButton icon={<MdBookmark />} onClick={handleBookmarkImport}>
                Import Bookmarks Now
              </GlassButton>
              {importStatus && (
                <p className="text-xs text-blue-500 font-medium mt-1 animate-fade-in">{importStatus}</p>
              )}
            </GlassCard>

            {/* JSON Import & Export */}
            <GlassCard className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <MdStorage className="w-5 h-5 text-blue-500" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Dashboard Backup & Restore</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                <GlassButton icon={<MdFileDownload />} onClick={handleExport}>Export Backup (JSON)</GlassButton>
                <GlassButton icon={<MdFileUpload />} onClick={handleImport}>Restore Backup (JSON)</GlassButton>
              </div>
            </GlassCard>

            {/* Danger Zone */}
            <GlassCard className="flex flex-col gap-3 border-red-500/20">
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-500">Danger Zone</p>
              <GlassButton variant="danger" icon={<MdDelete />} onClick={handleReset}>Reset All Data & Settings</GlassButton>
              <p className="text-xs text-gray-400">Permanently clears all links, folders, and restores default settings.</p>
            </GlassCard>
          </div>
        );

      case 'about':
        return (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">About ProdX Dashboard</h2>
            <GlassCard className="flex flex-col gap-4">
              <div>
                <h3 className="text-xl font-black bg-linear-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">ProdX New Tab</h3>
                <p className="text-sm text-gray-400 mt-0.5">Version 1.0.0</p>
              </div>
              <ul className="text-sm text-slate-700 dark:text-slate-300 flex flex-col gap-1.5 list-disc list-inside">
                <li>Minimalist, OS-inspired 3x4 paged grid dashboard</li>
                <li>Drag-to-merge smart folder engine with safe un-nesting</li>
                <li>Top-left floating task manager & top-right options control panel</li>
                <li>Customizable glassmorphism backdrop-blur, opacity, and wallpaper</li>
                <li>1-Click browser bookmark importer</li>
              </ul>
              <div className="border-t border-white/10 pt-4 text-xs text-gray-400 leading-relaxed">
                <strong>Privacy First:</strong> All dashboard data is saved locally on your device via IndexedDB. No tracking or telemetry.
              </div>
            </GlassCard>
          </div>
        );

      default:
        return null;
    }
  };

  const closeOptionsApp = () => {
    if (window.opener) {
      window.close();
    } else {
      window.location.href = '/src/pages/newtab/index.html';
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-slate-200/50 dark:border-white/10 p-5 flex flex-col gap-1 sticky top-0 h-screen overflow-y-auto bg-white/40 dark:bg-slate-900/40 backdrop-blur-lg">
        <div className="mb-6 px-2">
          <h1 className="text-lg font-black bg-linear-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">ProdX Dashboard</h1>
          <p className="text-[11px] text-gray-400 mt-0.5">Control Panel & Settings</p>
        </div>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer text-left ${
              activeSection === item.id
                ? 'bg-blue-500/15 text-blue-500 border border-blue-500/30'
                : 'hover:bg-slate-200/50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-transparent'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto max-w-4xl relative">
        {renderSection()}
        <button className="fixed top-5 right-5 z-50">
          <GlassButton variant="danger" onClick={closeOptionsApp}>Close Settings</GlassButton>
        </button>
      </main>

      <ToastContainer />
    </div>
  );
};

export default OptionsApp;

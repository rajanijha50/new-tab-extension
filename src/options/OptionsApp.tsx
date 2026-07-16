import React, { useEffect, useState, useRef } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { useCategoriesStore } from '../store/categoriesStore';
import { useLinksStore } from '../store/linksStore';
import { useToastStore } from '../store/toastStore';
import { storage } from '../services/storage';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { AddCategoryModal } from '../components/modals/AddCategoryModal';
import { ToastContainer } from '../components/Toast';
import {
  MdSettings, MdPalette, MdLink, MdCategory, MdInfo,
  MdFileDownload, MdFileUpload, MdDelete, MdAdd
} from 'react-icons/md';
import type { UserSettings } from '../types/settings';

type Section = 'general' | 'appearance' | 'links' | 'categories' | 'about';

const NAV_ITEMS: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: 'general', label: 'General', icon: <MdSettings /> },
  { id: 'appearance', label: 'Appearance', icon: <MdPalette /> },
  { id: 'links', label: 'Links & Data', icon: <MdLink /> },
  { id: 'categories', label: 'Categories', icon: <MdCategory /> },
  { id: 'about', label: 'About', icon: <MdInfo /> },
];

export const OptionsApp: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>('general');
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { settings, loadSettings, updateSetting } = useSettingsStore();
  const { categories, deleteCustomCategory, refreshCategories } = useCategoriesStore();
  const { links, fetchAllLinks } = useLinksStore();
  const { showToast } = useToastStore();

  useEffect(() => {
    loadSettings();
    fetchAllLinks();
    refreshCategories();
  }, [loadSettings, fetchAllLinks, refreshCategories]);

  const handleExport = async () => {
    try {
      const data = await storage.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-backup-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Data exported successfully', 'success');
    } catch (e: any) {
      showToast(e.message || 'Export failed', 'error');
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
        await fetchAllLinks();
        refreshCategories();
        showToast(`Imported ${result.linksImported} links successfully`, 'success');
      } catch (err: any) {
        showToast(err.message || 'Import failed. Invalid JSON file.', 'error');
      }
    };
    input.click();
  };

  const handleReset = async () => {
    if (window.confirm('Are you sure? This will delete ALL links and reset all settings.')) {
      await storage.reset();
      await fetchAllLinks();
      loadSettings();
      refreshCategories();
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
      updateSetting('wallpaper', reader.result as string);
      showToast('Wallpaper set', 'success');
    };
    reader.readAsDataURL(file);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'general':
        return (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold">General</h2>
            <GlassCard className="flex flex-col gap-5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Theme</label>
                <div className="flex gap-3">
                  {(['light', 'dark', 'auto'] as UserSettings['theme'][]).map((t) => (
                    <button
                      key={t}
                      onClick={() => updateSetting('theme', t)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 cursor-pointer capitalize ${
                        settings.theme === t
                          ? 'bg-accent-primary text-white border-accent-primary shadow-md shadow-accent-primary/25'
                          : 'glass border-white/20 dark:border-white/10 hover:border-accent-primary/40'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Quote Source</label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 dark:bg-white/5 border border-white/10">
                  <span className="text-lg">🌿</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">ZenQuotes.io</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Daily inspirational quote — refreshes every 24 hours</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        );

      case 'appearance':
        return (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold">Appearance</h2>
            <GlassCard className="flex flex-col gap-5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                  Glassmorphism Blur — {settings.glassBlur}px
                </label>
                <input
                  type="range"
                  min={0}
                  max={30}
                  value={settings.glassBlur}
                  onChange={(e) => updateSetting('glassBlur', parseInt(e.target.value))}
                  className="w-full accent-accent-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                  Glass Opacity — {Math.round(settings.glassOpacity * 100)}%
                </label>
                <input
                  type="range"
                  min={30}
                  max={95}
                  value={Math.round(settings.glassOpacity * 100)}
                  onChange={(e) => updateSetting('glassOpacity', parseInt(e.target.value) / 100)}
                  className="w-full accent-accent-primary"
                />
              </div>
              {/* Live preview */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Live Preview</label>
                <div className="glass rounded-2xl p-6 text-center text-sm font-semibold text-gray-700 dark:text-gray-200 border border-white/25 dark:border-white/10">
                  This is a preview of your glass effect
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Custom Wallpaper</label>
                <div className="flex flex-wrap items-center gap-3">
                  {settings.wallpaper && (
                    <div
                      className="w-16 h-10 rounded-lg bg-cover bg-center border border-white/20"
                      style={{ backgroundImage: `url(${settings.wallpaper})` }}
                    />
                  )}
                  <div>
                    <GlassButton
                      type="button"
                      icon={<MdFileUpload />}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Upload Wallpaper
                    </GlassButton>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleWallpaper}
                    />
                  </div>
                  {settings.wallpaper && (
                    <GlassButton
                      variant="danger"
                      onClick={() => { updateSetting('wallpaper', null); showToast('Wallpaper cleared', 'info'); }}
                    >
                      Clear
                    </GlassButton>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2">Max file size: 5MB. Stored as base64 in localStorage.</p>
              </div>
            </GlassCard>
          </div>
        );

      case 'links':
        return (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold">Links & Data</h2>
            <GlassCard className="flex flex-col gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Statistics</p>
                <p className="text-3xl font-black text-accent-primary">{links.length}</p>
                <p className="text-sm text-gray-500">total links saved</p>
              </div>
              <div className="border-t border-white/10 pt-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Per Category</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(
                    links.reduce((acc: Record<string, number>, l) => {
                      acc[l.category] = (acc[l.category] || 0) + 1;
                      return acc;
                    }, {})
                  ).map(([cat, count]) => (
                    <span key={cat} className="text-xs px-3 py-1 rounded-full glass border border-white/15 font-semibold">
                      {cat}: <span className="text-accent-primary">{count}</span>
                    </span>
                  ))}
                </div>
              </div>
            </GlassCard>
            <GlassCard className="flex flex-col gap-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Import / Export</p>
              <div className="flex flex-wrap gap-3">
                <GlassButton icon={<MdFileDownload />} onClick={handleExport}>
                  Export JSON
                </GlassButton>
                <GlassButton icon={<MdFileUpload />} onClick={handleImport}>
                  Import JSON
                </GlassButton>
              </div>
            </GlassCard>
            <GlassCard className="flex flex-col gap-3 border-accent-danger/20">
              <p className="text-[10px] font-bold uppercase tracking-widest text-accent-danger">Danger Zone</p>
              <GlassButton variant="danger" icon={<MdDelete />} onClick={handleReset}>
                Reset All Data
              </GlassButton>
              <p className="text-xs text-gray-400">This will permanently delete all links and reset all settings.</p>
            </GlassCard>
          </div>
        );

      case 'categories':
        return (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Categories</h2>
              <GlassButton variant="primary" icon={<MdAdd />} onClick={() => setIsAddCategoryOpen(true)}>
                Add Category
              </GlassButton>
            </div>
            {/* Custom categories */}
            <GlassCard className="flex flex-col gap-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Custom Categories</p>
              {Object.entries(categories).filter(([, data]) => !data.isBuiltIn).length === 0 ? (
                <p className="text-sm italic text-gray-400">No custom categories yet.</p>
              ) : (
                Object.entries(categories)
                  .filter(([, data]) => !data.isBuiltIn)
                  .map(([name, data]) => (
                    <div key={name} className="flex items-center justify-between p-3 rounded-xl glass border border-white/15">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-base" style={{ backgroundColor: data.color }}>
                          {data.icon.length <= 2 ? data.icon : '🔗'}
                        </div>
                        <span className="text-sm font-semibold capitalize">{name}</span>
                      </div>
                      <GlassButton
                        variant="danger"
                        onClick={() => {
                          if (window.confirm(`Delete category "${name}"?`)) {
                            deleteCustomCategory(name);
                            showToast(`Category "${name}" deleted`, 'info');
                          }
                        }}
                      >
                        <MdDelete />
                      </GlassButton>
                    </div>
                  ))
              )}
            </GlassCard>
            {/* Built-in categories */}
            <GlassCard className="flex flex-col gap-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Built-in Categories (Read-only)</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(categories)
                  .filter(([, data]) => data.isBuiltIn)
                  .map(([name, data]) => (
                    <div key={name} className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-white/15 text-xs font-semibold">
                      <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: data.color }} />
                      <span className="capitalize">{name}</span>
                    </div>
                  ))}
              </div>
            </GlassCard>
          </div>
        );

      case 'about':
        return (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold">About</h2>
            <GlassCard className="flex flex-col gap-4">
              <div>
                <h3 className="text-xl font-black bg-linear-to-r from-accent-primary to-accent-violet bg-clip-text text-transparent">New Tab Dashboard</h3>
                <p className="text-sm text-gray-400 mt-0.5">Version 1.0.0</p>
              </div>
              <ul className="text-sm text-gray-600 dark:text-gray-300 flex flex-col gap-1.5 list-disc list-inside">
                <li>Glassmorphic dashboard replaces your new tab</li>
                <li>Organize links by auto-detected categories</li>
                <li>Live search across all your links</li>
                <li>Multiple quote APIs with smart caching</li>
                <li>Custom wallpaper support</li>
                <li>Light, Dark, and Auto theme modes</li>
                <li>Import / Export data as JSON</li>
              </ul>
              <div className="border-t border-white/10 pt-4 text-xs text-gray-400 leading-relaxed">
                <strong>Privacy:</strong> All data is stored locally in your browser using IndexedDB and localStorage. No data is ever sent to any server except for fetching quotes.
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
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-white/10 p-4 flex flex-col gap-1 sticky top-0 h-screen overflow-y-auto">
        <div className="mb-4 px-2">
          <h1 className="text-base font-black bg-linear-to-r from-accent-primary to-accent-violet bg-clip-text text-transparent">Dashboard</h1>
          <p className="text-[10px] text-gray-400 mt-0.5">Settings</p>
        </div>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer text-left ${
              activeSection === item.id
                ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/30'
                : 'hover:bg-white/10 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-current border border-transparent'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto max-w-3xl">
        {renderSection()}
        <button className="mt-8 fixed top-5 right-5 m-4 z-50">
          <GlassButton variant="danger" onClick={closeOptionsApp}>
            Close Settings
          </GlassButton>
        </button>
      </main>

      {/* Modals */}
      <AddCategoryModal
        isOpen={isAddCategoryOpen}
        onClose={() => {
          setIsAddCategoryOpen(false);
          refreshCategories();
        }}
      />
      <ToastContainer />
    </div>
  );
};

export default OptionsApp;

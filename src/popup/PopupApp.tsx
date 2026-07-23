import React, { useEffect } from 'react';
import { useGridStore } from '../store/gridStore';
import { useSettingsStore } from '../store/settingsStore';
import { MdOpenInNew, MdSettings } from 'react-icons/md';

export const PopupApp: React.FC = () => {
  const { items, loadItems } = useGridStore();
  const { loadSettings } = useSettingsStore();

  useEffect(() => {
    loadSettings();
    loadItems();
  }, [loadSettings, loadItems]);

  const links = items.filter((i) => i.type === 'link');
  const folders = items.filter((i) => i.type === 'folder');

  const openNewTab = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: 'chrome://newtab' });
    } else {
      window.open('/src/pages/newtab/index.html', '_blank');
    }
  };

  const openSettings = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open('/src/pages/options/index.html', '_blank');
    }
  };

  return (
    <div className="w-[350px] min-h-[280px] flex flex-col p-5 gap-4 font-sans bg-(--bg-primary) text-(--text-primary) transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-linear-to-r from-accent-primary to-accent-violet flex items-center justify-center text-white font-black text-sm">D</div>
        <div>
          <h1 className="text-sm font-black leading-none">New Tab Dashboard</h1>
          <p className="text-[10px] text-gray-400 mt-0.5">Your custom start page</p>
        </div>
      </div>

      {/* Stats */}
      <div className="glass rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Total Links</span>
          <span className="text-2xl font-black text-accent-primary">{links.length}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Folders</span>
          <span className="text-2xl font-black text-accent-violet">{folders.length}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <button
          onClick={openNewTab}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent-primary text-white text-sm font-semibold hover:bg-accent-primary/85 transition-all duration-200 cursor-pointer active:scale-95"
        >
          <MdOpenInNew className="text-base" />
          Open New Tab
        </button>
        <button
          onClick={openSettings}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl glass border border-white/20 dark:border-white/10 text-sm font-semibold hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-200 cursor-pointer active:scale-95"
        >
          <MdSettings className="text-base" />
          Open Settings
        </button>
      </div>
    </div>
  );
};

export default PopupApp;

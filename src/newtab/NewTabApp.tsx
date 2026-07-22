import React, { useEffect, useState } from 'react';
import { FiSettings } from 'react-icons/fi';
import { ClockWidget } from '../components/clock/ClockWidget';
import { TodoWidgetPanel } from '../components/todo/TodoWidgetPanel';
import { GridContainer } from '../components/grid/GridContainer';
import { FolderModal } from '../components/folder/FolderModal';
import { FAB } from '../components/ui/FAB';
import { SingleFieldAddModal } from '../components/ui/SingleFieldAddModal';
import { useGridStore } from '../store/gridStore';
import { useSettingsStore } from '../store/settingsStore';
import type { FolderItem } from '../types/grid';

export const NewTabApp: React.FC = () => {
  const { loadItems } = useGridStore();
  const { settings, loadSettings } = useSettingsStore();

  const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);
  const [openFolder, setOpenFolder] = useState<FolderItem | null>(null);

  useEffect(() => {
    loadSettings();
    loadItems();
  }, [loadSettings, loadItems]);

  const openSettingsPage = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open('/src/pages/options/index.html', '_blank');
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-between p-4 sm:p-6 overflow-hidden select-none">
      {/* Background Wallpaper */}
      {settings.wallpaper && (
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat transition-all duration-500"
          style={{ backgroundImage: `url(${settings.wallpaper})` }}
        />
      )}

      {/* Floating Top Controls (Navbar-Free Focal Header) */}
      <header className="w-full flex items-center justify-between z-30 max-w-7xl mx-auto">
        {/* Top-Left Floating Todo Launcher */}
        <TodoWidgetPanel />

        {/* Top-Right Floating Settings Launcher -> Opens Full Options Page */}
        <button
          onClick={openSettingsPage}
          className="glass-button p-2.5 text-slate-800 dark:text-slate-100 rounded-xl shadow-md hover:shadow-lg transition-all"
          title="Open Dashboard Settings"
        >
          <FiSettings className="w-5 h-5" />
        </button>
      </header>

      {/* Main Focal Area */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl mx-auto my-auto z-10">
        {/* Upper-Third Centered Clock Widget */}
        <ClockWidget />

        {/* 3x4 Paged Grid & Multi-page Carousel System */}
        <GridContainer onOpenFolder={(folder) => setOpenFolder(folder)} />
      </main>

      {/* Bottom-Right Floating Action Button (+) */}
      <FAB onClick={() => setIsAddLinkOpen(true)} />

      {/* Modals & Overlays */}
      <SingleFieldAddModal isOpen={isAddLinkOpen} onClose={() => setIsAddLinkOpen(false)} />
      <FolderModal folder={openFolder} onClose={() => setOpenFolder(null)} />
    </div>
  );
};

export default NewTabApp;

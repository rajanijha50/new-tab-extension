import React from 'react';
import { MdDarkMode, MdLightMode, MdAutorenew } from 'react-icons/md';
import { IoSettingsSharp } from 'react-icons/io5';
import { GlassInput } from './ui/GlassInput';
import { useSettingsStore } from '../store/settingsStore';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSettingsClick: () => void;
  leftSlot?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onSettingsClick,
  leftSlot,
}) => {
  const { settings, updateSetting } = useSettingsStore();

  const handleThemeToggle = () => {
    const themes: Array<'light' | 'dark' | 'auto'> = ['light', 'dark', 'auto'];
    const nextIndex = (themes.indexOf(settings.theme) + 1) % themes.length;
    updateSetting('theme', themes[nextIndex]);
  };

  const getThemeIcon = () => {
    switch (settings.theme) {
      case 'light': return <MdLightMode className="text-lg" />;
      case 'dark': return <MdDarkMode className="text-lg" />;
      default: return <MdAutorenew className="text-lg animate-spin-slow" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full px-4 py-3 flex items-center justify-between gap-3 backdrop-blur-2xl bg-white/50 dark:bg-black/35 border-b border-white/12 dark:border-white/6">
      {/* Left: Todo + Title */}
      <div className="flex items-center gap-2.5 shrink-0">
        {leftSlot}
        <h1 className="text-lg font-extrabold tracking-tight bg-linear-to-r from-accent-primary via-accent-violet to-accent-rose bg-clip-text text-transparent hidden sm:block">
          Dashboard
        </h1>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-xs mx-2">
        <GlassInput
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="py-1.5 text-xs rounded-xl"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={handleThemeToggle}
          className="p-2 rounded-xl glass hover:bg-white/25 dark:hover:bg-white/10 text-current transition-all duration-200 cursor-pointer active:scale-95"
          title={`Theme: ${settings.theme}`}
          aria-label="Toggle theme"
        >
          {getThemeIcon()}
        </button>
        <button
          onClick={onSettingsClick}
          className="p-2 rounded-xl glass hover:bg-white/25 dark:hover:bg-white/10 text-current transition-all duration-200 cursor-pointer active:scale-95"
          title="Settings"
          aria-label="Settings"
        >
          <IoSettingsSharp className="text-lg" />
        </button>
      </div>
    </header>
  );
};

export default Header;

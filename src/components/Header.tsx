import React from 'react';
import { MdDarkMode, MdLightMode, MdAutorenew } from 'react-icons/md';
import { IoSettingsSharp } from 'react-icons/io5';
import { GlassInput } from './ui/GlassInput';
import { useSettingsStore } from '../store/settingsStore';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSettingsClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onSettingsClick,
}) => {
  const { settings, updateSetting } = useSettingsStore();

  const handleThemeToggle = () => {
    const themes: Array<'light' | 'dark' | 'auto'> = ['light', 'dark', 'auto'];
    const nextIndex = (themes.indexOf(settings.theme) + 1) % themes.length;
    updateSetting('theme', themes[nextIndex]);
  };

  const getThemeIcon = () => {
    switch (settings.theme) {
      case 'light':
        return <MdLightMode className="text-xl" />;
      case 'dark':
        return <MdDarkMode className="text-xl" />;
      default:
        return <MdAutorenew className="text-xl animate-spin-slow" />;
    }
  };

  const getThemeLabel = () => {
    switch (settings.theme) {
      case 'light':
        return 'Theme: Light';
      case 'dark':
        return 'Theme: Dark';
      default:
        return 'Theme: Auto (System)';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full px-6 py-4 flex items-center justify-between backdrop-blur-md bg-white/5 dark:bg-black/5 border-b border-white/10">
      {/* Title */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-black tracking-wide bg-linear-to-r from-accent-primary via-accent-violet to-accent-rose bg-clip-text text-transparent">
          Dashboard
        </h1>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md mx-6">
        <GlassInput
          type="text"
          placeholder="Search links, domains, or categories..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="py-2 text-sm"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleThemeToggle}
          className="p-2.5 rounded-xl glass bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 border-white/20 dark:border-white/5 text-current transition-all duration-200 cursor-pointer active:scale-95"
          title={getThemeLabel()}
          aria-label="Toggle theme"
        >
          {getThemeIcon()}
        </button>

        <button
          onClick={onSettingsClick}
          className="p-2.5 rounded-xl glass bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 border-white/20 dark:border-white/5 text-current transition-all duration-200 cursor-pointer active:scale-95"
          title="Open settings"
          aria-label="Open settings"
        >
          <IoSettingsSharp className="text-xl" />
        </button>
      </div>
    </header>
  );
};

export default Header;

import { create } from 'zustand';
import type { UserSettings } from '../types/settings';
import { storage } from '../services/storage';
import { themeManager } from '../services/theme';

interface SettingsState {
  settings: UserSettings;
  updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
  loadSettings: () => void;
}

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'auto',
  glassBlur: 10,
  glassOpacity: 0.7,
  wallpaper: null,
};

function applyStylesToDocument(settings: UserSettings) {
  document.documentElement.style.setProperty('--glass-blur', `${settings.glassBlur}px`);
  document.documentElement.style.setProperty('--glass-opacity', `${settings.glassOpacity}`);
  document.documentElement.style.setProperty('--glass-border-opacity', `${settings.glassOpacity > 0.6 ? 0.2 : 0.08}`);
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: DEFAULT_SETTINGS,

  loadSettings: () => {
    const theme = storage.getPreference<UserSettings['theme']>('theme', 'auto');
    const glassBlur = storage.getPreference<UserSettings['glassBlur']>('glassBlur', 10);
    const glassOpacity = storage.getPreference<UserSettings['glassOpacity']>('glassOpacity', 0.7);
    const wallpaper = storage.getPreference<UserSettings['wallpaper']>('wallpaper', null);

    const loadedSettings: UserSettings = {
      theme,
      glassBlur,
      glassOpacity,
      wallpaper,
    };

    set({ settings: loadedSettings });

    // Apply styling rules
    applyStylesToDocument(loadedSettings);
    themeManager.applyTheme(theme);
  },

  updateSetting: (key, value) => {
    storage.setPreference(key, value);

    set((state) => {
      const nextSettings = { ...state.settings, [key]: value };

      applyStylesToDocument(nextSettings);

      if (key === 'theme') {
        themeManager.applyTheme(value as UserSettings['theme']);
      }

      return { settings: nextSettings };
    });
  },
}));
export default useSettingsStore;


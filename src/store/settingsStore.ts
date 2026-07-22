import { create } from 'zustand';
import type { UserSettings } from '../types/settings';
import { storage } from '../services/storage';
import { themeManager } from '../services/theme';

interface SettingsState {
  settings: UserSettings;
  updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
  setGlassBlur: (blur: number) => void;
  setGlassOpacity: (opacity: number) => void;
  setWallpaper: (wallpaper: string | null) => void;
  setTheme: (theme: UserSettings['theme']) => void;
  toggleShowLinkName: () => void;
  loadSettings: () => void;
}

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'auto',
  glassBlur: 10,
  glassOpacity: 0.7,
  wallpaper: null,
  showLinkName: true,
};

function applyStylesToDocument(settings: UserSettings) {
  document.documentElement.style.setProperty('--glass-blur', `${settings.glassBlur}px`);
  document.documentElement.style.setProperty('--glass-opacity', `${settings.glassOpacity}`);
  document.documentElement.style.setProperty('--glass-border-opacity', `${settings.glassOpacity > 0.6 ? 0.2 : 0.08}`);
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,

  loadSettings: () => {
    const loadedSettings: UserSettings = {
      theme: storage.getPreference<UserSettings['theme']>('theme', 'auto'),
      glassBlur: storage.getPreference<UserSettings['glassBlur']>('glassBlur', 10),
      glassOpacity: storage.getPreference<UserSettings['glassOpacity']>('glassOpacity', 0.7),
      wallpaper: storage.getPreference<UserSettings['wallpaper']>('wallpaper', null),
      showLinkName: storage.getPreference<UserSettings['showLinkName']>('showLinkName', true),
    };

    set({ settings: loadedSettings });
    applyStylesToDocument(loadedSettings);
    themeManager.applyTheme(loadedSettings.theme);
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

  setGlassBlur: (blur: number) => {
    get().updateSetting('glassBlur', blur);
  },

  setGlassOpacity: (opacity: number) => {
    get().updateSetting('glassOpacity', opacity);
  },

  setWallpaper: (wallpaper: string | null) => {
    get().updateSetting('wallpaper', wallpaper);
  },

  setTheme: (theme: UserSettings['theme']) => {
    get().updateSetting('theme', theme);
  },

  toggleShowLinkName: () => {
    const current = get().settings.showLinkName;
    get().updateSetting('showLinkName', !current);
  },
}));

export default useSettingsStore;

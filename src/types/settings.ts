export type ThemeMode = 'light' | 'dark' | 'auto';

export interface UserSettings {
  theme: ThemeMode;
  glassBlur: number;
  glassOpacity: number;
  wallpaper: string | null;
  showLinkName: boolean;
}

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface UserSettings {
  theme: ThemeMode;
  glassBlur: number;          // 0–30 (px)
  glassOpacity: number;       // 0.3–0.95
  wallpaper: string | null;   // base64 data URL or null
}

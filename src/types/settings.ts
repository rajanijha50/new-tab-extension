export type ThemeMode = 'light' | 'dark' | 'auto';
export type QuoteApiType = 'quotable' | 'zenquotes' | 'adviceslip';

export interface UserSettings {
  theme: ThemeMode;
  quoteApi: QuoteApiType;
  glassBlur: number;          // 0–30 (px)
  glassOpacity: number;       // 0.3–0.95
  wallpaper: string | null;   // base64 data URL or null
}

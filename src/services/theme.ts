import type { ThemeMode } from '../types/settings';

class ThemeManager {
  private mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  private listener: ((e: MediaQueryListEvent) => void) | null = null;

  init(): void {
    const current = this.getCurrent();
    this.applyTheme(current);
  }

  getCurrent(): ThemeMode {
    const stored = localStorage.getItem('pref_theme');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ThemeMode;
        if (['light', 'dark', 'auto'].includes(parsed)) {
          return parsed;
        }
      } catch {
        if (['light', 'dark', 'auto'].includes(stored)) {
          return stored as ThemeMode;
        }
      }
    }
    return 'auto';
  }

  getEffective(): 'light' | 'dark' {
    const current = this.getCurrent();
    if (current === 'auto') {
      return this.mediaQuery.matches ? 'dark' : 'light';
    }
    return current;
  }

  applyTheme(theme: ThemeMode): void {
    localStorage.setItem('pref_theme', JSON.stringify(theme));
    const effective = theme === 'auto' ? (this.mediaQuery.matches ? 'dark' : 'light') : theme;
    
    document.documentElement.setAttribute('data-theme', effective);
    
    // Set system color-scheme style properties
    document.documentElement.style.colorScheme = effective;

    // Handle system changes if in 'auto' mode
    if (theme === 'auto') {
      if (!this.listener) {
        this.listener = (e: MediaQueryListEvent) => {
          if (this.getCurrent() === 'auto') {
            const resolved = e.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', resolved);
            document.documentElement.style.colorScheme = resolved;
            window.dispatchEvent(new CustomEvent('themechange', { detail: resolved }));
          }
        };
        this.mediaQuery.addEventListener('change', this.listener);
      }
    } else {
      if (this.listener) {
        this.mediaQuery.removeEventListener('change', this.listener);
        this.listener = null;
      }
    }

    window.dispatchEvent(new CustomEvent('themechange', { detail: effective }));
  }

  toggle(): ThemeMode {
    const current = this.getCurrent();
    let next: ThemeMode;
    if (current === 'light') {
      next = 'dark';
    } else if (current === 'dark') {
      next = 'auto';
    } else {
      next = 'light';
    }
    this.applyTheme(next);
    return next;
  }
}

export const themeManager = new ThemeManager();
export default themeManager;

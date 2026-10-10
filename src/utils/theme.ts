export type ThemeMode = 'light' | 'dark' | 'system';

const THEME_STORAGE_KEY = 'magic_nutri_theme_v1';

export function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  try {
    const val = localStorage.getItem(THEME_STORAGE_KEY);
    if (val === 'dark' || val === 'light' || val === 'system') {
      return val;
    }
  } catch {
    // ignore
  }
  return 'light';
}

export function isSystemDark(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function applyTheme(mode: ThemeMode): boolean {
  if (typeof document === 'undefined') return false;
  const isDark = mode === 'dark' || (mode === 'system' && isSystemDark());
  const root = document.documentElement;

  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // ignore
  }

  // Dispatch notification for React state syncing
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('magic-nutri-theme-change', { detail: { mode, isDark } }));
  }

  return isDark;
}

export function initTheme(): ThemeMode {
  const mode = getStoredTheme();
  applyTheme(mode);

  // Setup system preference change listener
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      const current = getStoredTheme();
      if (current === 'system') {
        applyTheme('system');
      }
    });
  }

  return mode;
}

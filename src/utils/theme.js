import { THEME_CONFIG } from './constants.js';

// Simple global theme manager using Tailwind 'class' strategy
// Persists preference in localStorage and respects system preference

export function getSystemTheme() {
  if (typeof window === 'undefined') return THEME_CONFIG.DEFAULT_THEME;
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? THEME_CONFIG.THEMES.DARK
    : THEME_CONFIG.THEMES.LIGHT;
}

export function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_CONFIG.STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to get stored theme:', error);
    return null;
  }
}

export function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === THEME_CONFIG.THEMES.DARK) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function initTheme() {
  const stored = getStoredTheme();
  const theme = stored || getSystemTheme();
  applyTheme(theme);
  return theme;
}

export function toggleTheme() {
  const isDark = document.documentElement.classList.contains('dark');
  const next = isDark ? THEME_CONFIG.THEMES.LIGHT : THEME_CONFIG.THEMES.DARK;
  try {
    localStorage.setItem(THEME_CONFIG.STORAGE_KEY, next);
  } catch (error) {
    console.warn('Failed to save theme preference:', error);
  }
  applyTheme(next);
  return next;
}

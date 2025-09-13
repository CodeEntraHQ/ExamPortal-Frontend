import { useState, useEffect } from 'react';
import { initTheme, toggleTheme } from '../utils/theme.js';
import { THEME_CONFIG } from '../utils/constants.js';

/**
 * Custom hook for theme management
 * @returns {Object} Theme state and functions
 */
export function useTheme() {
  const [isDark, setIsDark] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize theme on mount
    const currentTheme = initTheme();
    setIsDark(currentTheme === THEME_CONFIG.THEMES.DARK);
    setIsInitialized(true);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = e => {
      // Only update if no user preference is stored
      const storedTheme = localStorage.getItem(THEME_CONFIG.STORAGE_KEY);
      if (!storedTheme) {
        const systemTheme = e.matches
          ? THEME_CONFIG.THEMES.DARK
          : THEME_CONFIG.THEMES.LIGHT;
        setIsDark(systemTheme === THEME_CONFIG.THEMES.DARK);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);

    // Listen for theme changes from other components
    const observer = new MutationObserver(() => {
      const isCurrentlyDark =
        document.documentElement.classList.contains('dark');
      setIsDark(isCurrentlyDark);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
      observer.disconnect();
    };
  }, []);

  const toggle = () => {
    const newTheme = toggleTheme();
    setIsDark(newTheme === THEME_CONFIG.THEMES.DARK);
    return newTheme;
  };

  const setTheme = theme => {
    if (
      theme === THEME_CONFIG.THEMES.DARK ||
      theme === THEME_CONFIG.THEMES.LIGHT
    ) {
      try {
        localStorage.setItem(THEME_CONFIG.STORAGE_KEY, theme);
      } catch (error) {
        console.warn('Failed to save theme preference:', error);
      }
      document.documentElement.classList.toggle(
        'dark',
        theme === THEME_CONFIG.THEMES.DARK
      );
      setIsDark(theme === THEME_CONFIG.THEMES.DARK);
    }
  };

  return {
    isDark,
    isLight: !isDark,
    isInitialized,
    toggle,
    setTheme,
    currentTheme: isDark ? THEME_CONFIG.THEMES.DARK : THEME_CONFIG.THEMES.LIGHT,
  };
}

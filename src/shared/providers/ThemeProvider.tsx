import React, { createContext, useContext, useEffect, useState } from 'react';
import { envConfig } from '@/config/env';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const resolveTheme = (value: string | null | undefined, fallback: Theme): Theme => {
  return value === 'dark' ? 'dark' : value === 'light' ? 'light' : fallback;
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const defaultTheme = resolveTheme(envConfig.defaultTheme, 'light');
  const storageKey = envConfig.themeStorageKey;
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(storageKey) as Theme | null;
      if (savedTheme) {
        setTheme(resolveTheme(savedTheme, defaultTheme));
      }
    } catch (error) {
      console.warn('Unable to read theme from storage', error);
    }
  }, [storageKey, defaultTheme]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem(storageKey, theme);
    } catch (error) {
      console.warn('Unable to persist theme to storage', error);
    }
  }, [theme, storageKey]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
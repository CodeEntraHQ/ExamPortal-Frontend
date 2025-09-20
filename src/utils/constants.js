/**
 * Application constants and configuration
 * Centralized configuration for all constants and environment variables
 */

// Route paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  ABOUT: '/about',
  CONTACT: '/contact',
};

// User roles
export const USER_ROLES = {
  STUDENT: 'student',
  ADMIN: 'admin',
  SUPER_ADMIN: 'superadmin',
};

// Role mapping for navigation
export const ROLE_MAPPING = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  STUDENT: 'student',
};

// Form validation
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
};

// Animation durations
export const ANIMATION = {
  FAST: '150ms',
  NORMAL: '200ms',
  SLOW: '300ms',
};

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL,
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT),
};

// Application Configuration
export const APP_CONFIG = {
  NAME: import.meta.env.VITE_APP_NAME,
  DESCRIPTION: import.meta.env.VITE_APP_DESCRIPTION,
  VERSION: import.meta.env.VITE_APP_VERSION,
};

// Token Management Configuration
export const TOKEN_CONFIG = {
  RENEWAL_THRESHOLD: parseInt(import.meta.env.VITE_TOKEN_RENEWAL_THRESHOLD),
  IDLE_THRESHOLD: parseInt(import.meta.env.VITE_TOKEN_IDLE_THRESHOLD),
  CHECK_INTERVAL: parseInt(import.meta.env.VITE_TOKEN_CHECK_INTERVAL),
};

// Theme Configuration
export const THEME_CONFIG = {
  STORAGE_KEY: import.meta.env.VITE_THEME_STORAGE_KEY,
  DEFAULT_THEME: import.meta.env.VITE_DEFAULT_THEME,
  THEMES: {
    LIGHT: 'light',
    DARK: 'dark',
  },
};

// Development Configuration
export const DEV_CONFIG = {
  PORT: parseInt(import.meta.env.VITE_DEV_PORT),
  OPEN_BROWSER: import.meta.env.VITE_DEV_OPEN_BROWSER === 'true',
};

// Build Configuration
export const BUILD_CONFIG = {
  OUT_DIR: import.meta.env.VITE_BUILD_OUT_DIR,
  SOURCEMAP: import.meta.env.VITE_BUILD_SOURCEMAP === 'true',
};

/**
 * Application constants and configuration
 */

// Theme configuration
export const THEME_CONFIG = {
  STORAGE_KEY: 'examentra-theme',
  DEFAULT_THEME: 'light',
  THEMES: {
    LIGHT: 'light',
    DARK: 'dark',
  },
};

// Application metadata
export const APP_CONFIG = {
  NAME: 'ExamEntra',
  DESCRIPTION:
    'A secure and modern platform for conducting scholarship exams online',
  VERSION: '1.0.0',
};

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

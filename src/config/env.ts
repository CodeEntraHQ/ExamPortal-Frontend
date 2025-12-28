/// <reference types="vite/client" />

const env = import.meta.env;

const DEFAULT_ALLOWED_IMAGE_TYPES = 'image/jpeg,image/jpg,image/png,image/webp';

const splitList = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

// Runtime config from window (injected at container startup)
const runtime = (typeof window !== 'undefined' && (window as any).__ENV__) || {};

export const envConfig = Object.freeze({
  apiBaseUrl: runtime.API_BASE_URL || env.VITE_API_BASE_URL || 'http://localhost:8000',
  apiTimeout: Number(runtime.API_TIMEOUT || env.VITE_API_TIMEOUT) || 30_000,
  appName: runtime.APP_NAME || env.VITE_APP_NAME || 'ExamEntra',
  appVersion: runtime.APP_VERSION || env.VITE_APP_VERSION || '1.0.0',
  appDescription: runtime.APP_DESCRIPTION || env.VITE_APP_DESCRIPTION || 'A secure and modern platform for conducting scholarship exams online',
  tokenRenewalThreshold: Number(runtime.TOKEN_RENEWAL_THRESHOLD || env.VITE_TOKEN_RENEWAL_THRESHOLD) || 120_000,
  tokenIdleThreshold: Number(runtime.TOKEN_IDLE_THRESHOLD || env.VITE_TOKEN_IDLE_THRESHOLD) || 300_000,
  tokenCheckInterval: Number(runtime.TOKEN_CHECK_INTERVAL || env.VITE_TOKEN_CHECK_INTERVAL) || 30_000,
  themeStorageKey: runtime.THEME_STORAGE_KEY || env.VITE_THEME_STORAGE_KEY || 'examentra-theme',
  defaultTheme: runtime.DEFAULT_THEME || env.VITE_DEFAULT_THEME || 'light',
  devPort: Number(env.VITE_DEV_PORT) || 5173,
  devOpenBrowser: env.VITE_DEV_OPEN_BROWSER !== 'false',
  buildOutDir: env.VITE_BUILD_OUT_DIR || 'dist',
  buildSourcemap: env.VITE_BUILD_SOURCEMAP !== 'false',
  maxFileSize: Number(runtime.MAX_FILE_SIZE || env.VITE_MAX_FILE_SIZE) || 5 * 1024 * 1024,
  allowedImageTypes: splitList(runtime.ALLOWED_IMAGE_TYPES || env.VITE_ALLOWED_IMAGE_TYPES || DEFAULT_ALLOWED_IMAGE_TYPES),
  imageMaxWidth: Number(runtime.IMAGE_MAX_WIDTH || env.VITE_IMAGE_MAX_WIDTH) || 1920,
  imageMaxHeight: Number(runtime.IMAGE_MAX_HEIGHT || env.VITE_IMAGE_MAX_HEIGHT) || 1080,
});

export type EnvConfig = typeof envConfig;

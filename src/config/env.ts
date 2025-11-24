/// <reference types="vite/client" />

const env = import.meta.env;

const DEFAULT_ALLOWED_IMAGE_TYPES = 'image/jpeg,image/jpg,image/png,image/webp';

const splitList = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

export const envConfig = Object.freeze({
  apiBaseUrl: env.VITE_API_BASE_URL || 'http://localhost:8000',
  apiTimeout: Number(env.VITE_API_TIMEOUT) || 30_000,
  appName: env.VITE_APP_NAME || 'ExamEntra',
  appVersion: env.VITE_APP_VERSION || '1.0.0',
  appDescription: env.VITE_APP_DESCRIPTION || 'A secure and modern platform for conducting scholarship exams online',
  tokenRenewalThreshold: Number(env.VITE_TOKEN_RENEWAL_THRESHOLD) || 120_000,
  tokenIdleThreshold: Number(env.VITE_TOKEN_IDLE_THRESHOLD) || 300_000,
  tokenCheckInterval: Number(env.VITE_TOKEN_CHECK_INTERVAL) || 30_000,
  themeStorageKey: env.VITE_THEME_STORAGE_KEY || 'examentra-theme',
  defaultTheme: env.VITE_DEFAULT_THEME || 'light',
  devPort: Number(env.VITE_DEV_PORT) || 5173,
  devOpenBrowser: env.VITE_DEV_OPEN_BROWSER !== 'false',
  buildOutDir: env.VITE_BUILD_OUT_DIR || 'dist',
  buildSourcemap: env.VITE_BUILD_SOURCEMAP !== 'false',
  maxFileSize: Number(env.VITE_MAX_FILE_SIZE) || 5 * 1024 * 1024,
  allowedImageTypes: splitList(env.VITE_ALLOWED_IMAGE_TYPES || DEFAULT_ALLOWED_IMAGE_TYPES),
  imageMaxWidth: Number(env.VITE_IMAGE_MAX_WIDTH) || 1920,
  imageMaxHeight: Number(env.VITE_IMAGE_MAX_HEIGHT) || 1080,
});

export type EnvConfig = typeof envConfig;


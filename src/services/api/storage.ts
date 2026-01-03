/**
 * Centralized storage management for authentication-related data
 * Provides a single source of truth for clearing all auth-related storage
 * Uses sessionStorage so data is cleared when browser tab/window is closed
 */

/**
 * List of all sessionStorage keys that should be cleared on logout
 */
const AUTH_STORAGE_KEYS = [
  'token',
  'user',
  'currentExam',
  // Note: 'rememberedEmail' and 'theme' are intentionally excluded
  // as they are user preferences, not authentication data (stored in localStorage)
] as const;

/**
 * Clear all authentication-related data from sessionStorage
 */
export function clearAuthStorage(): void {
  AUTH_STORAGE_KEYS.forEach((key) => {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove ${key} from sessionStorage:`, error);
    }
  });
}

/**
 * Clear all application data from localStorage (use with caution)
 * This includes auth data and user preferences
 */
export function clearAllStorage(): void {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
  }
}


import { useTheme } from '../../hooks/useTheme.js';

/**
 * Theme toggle button component with proper state management
 */
export default function ThemeToggle() {
  const { isDark, toggle } = useTheme();

  const handleToggle = () => {
    toggle();
  };

  return (
    <button
      type='button'
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className='btn-ghost'
      onClick={handleToggle}
    >
      {isDark ? (
        <svg
          className='w-5 h-5'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
        >
          <path
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M12 3v2m0 14v2m9-9h-2M5 12H3m15.364 6.364l-1.414-1.414M7.05 7.05 5.636 5.636m12.728 0-1.414 1.414M7.05 16.95l-1.414 1.414M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z'
          />
        </svg>
      ) : (
        <svg
          className='w-5 h-5'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
        >
          <path
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z'
          />
        </svg>
      )}
    </button>
  );
}

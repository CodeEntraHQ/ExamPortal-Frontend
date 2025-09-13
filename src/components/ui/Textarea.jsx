import { forwardRef } from 'react';

/**
 * Reusable Textarea component with consistent styling
 * @param {Object} props - Component props
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.error - Error state
 * @param {string} props.errorMessage - Error message
 * @param {number} props.rows - Number of rows
 */
const Textarea = forwardRef(function Textarea(
  {
    placeholder = '',
    className = '',
    error = false,
    errorMessage = '',
    rows = 4,
    ...props
  },
  ref
) {
  const baseClasses =
    'block w-full rounded-lg border-2 bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100 shadow-sm focus:ring-2 focus:ring-offset-0 transition-all duration-200 placeholder-secondary-400 dark:placeholder-secondary-500 resize-vertical';

  const stateClasses = error
    ? 'border-error-500 focus:border-error-500 focus:ring-error-200 dark:focus:ring-error-900/20'
    : 'border-primary-200 dark:border-secondary-600 focus:border-primary-500 focus:ring-primary-100 dark:focus:ring-primary-900/20';

  const combinedClasses =
    `${baseClasses} ${stateClasses} py-4 px-6 text-lg ${className}`.trim();

  return (
    <div>
      <textarea
        ref={ref}
        rows={rows}
        className={combinedClasses}
        placeholder={placeholder}
        {...props}
      />
      {error && errorMessage && (
        <p className='mt-2 text-sm text-error-600 dark:text-error-400'>
          {errorMessage}
        </p>
      )}
    </div>
  );
});

export default Textarea;

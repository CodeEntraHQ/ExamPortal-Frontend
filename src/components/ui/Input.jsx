import { forwardRef } from 'react';

/**
 * Reusable Input component with consistent styling
 * @param {Object} props - Component props
 * @param {string} props.type - Input type
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.error - Error state
 * @param {string} props.errorMessage - Error message
 * @param {React.ReactNode} props.icon - Icon element
 * @param {React.ReactNode} props.rightIcon - Right icon element
 */
const Input = forwardRef(function Input(
  {
    type = 'text',
    placeholder = '',
    className = '',
    error = false,
    errorMessage = '',
    icon = null,
    rightIcon = null,
    ...props
  },
  ref
) {
  const baseClasses =
    'block w-full rounded-lg border-2 bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100 shadow-sm focus:ring-2 focus:ring-offset-0 transition-all duration-200 placeholder-secondary-400 dark:placeholder-secondary-500';

  const stateClasses = error
    ? 'border-error-500 focus:border-error-500 focus:ring-error-200 dark:focus:ring-error-900/20'
    : 'border-primary-200 dark:border-secondary-600 focus:border-primary-500 focus:ring-primary-100 dark:focus:ring-primary-900/20';

  const paddingClasses = icon ? 'pl-12' : 'px-6';
  const rightPaddingClasses = rightIcon ? 'pr-12' : '';

  const combinedClasses =
    `${baseClasses} ${stateClasses} ${paddingClasses} ${rightPaddingClasses} py-4 text-lg ${className}`.trim();

  return (
    <div className='relative'>
      {icon && (
        <div className='absolute inset-y-0 left-0 flex items-center pl-6'>
          {icon}
        </div>
      )}
      <input
        ref={ref}
        type={type}
        className={combinedClasses}
        placeholder={placeholder}
        {...props}
      />
      {rightIcon && (
        <div className='absolute inset-y-0 right-0 flex items-center pr-4'>
          {rightIcon}
        </div>
      )}
      {error && errorMessage && (
        <p className='mt-2 text-sm text-error-600 dark:text-error-400'>
          {errorMessage}
        </p>
      )}
    </div>
  );
});

export default Input;

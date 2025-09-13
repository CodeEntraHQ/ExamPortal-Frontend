/**
 * Reusable Label component with consistent styling
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Label content
 * @param {string} props.htmlFor - Associated input ID
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.required - Required field indicator
 */
export default function Label({
  children,
  htmlFor,
  className = '',
  required = false,
  ...props
}) {
  const baseClasses =
    'block text-lg font-semibold text-secondary-700 dark:text-secondary-300 mb-3';
  const combinedClasses = `${baseClasses} ${className}`.trim();

  return (
    <label htmlFor={htmlFor} className={combinedClasses} {...props}>
      {children}
      {required && <span className='text-error-500 ml-1'>*</span>}
    </label>
  );
}

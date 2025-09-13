/**
 * Reusable Card component with consistent styling
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.hover - Enable hover effects
 * @param {string} props.variant - Card variant (default, elevated, outlined)
 */
export default function Card({
  children,
  className = '',
  hover = true,
  variant = 'default',
  ...props
}) {
  const baseClasses =
    'bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700 p-6';

  const variantClasses = {
    default: 'shadow-sm',
    elevated: 'shadow-lg',
    outlined: 'shadow-none border-2',
  };

  const hoverClasses = hover
    ? 'hover:shadow-md transition-shadow duration-300'
    : '';

  const combinedClasses =
    `${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${className}`.trim();

  return (
    <div className={combinedClasses} {...props}>
      {children}
    </div>
  );
}

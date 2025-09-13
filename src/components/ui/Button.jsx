export default function Button({
  children,
  onClick,
  variant = 'primary',
  color = 'primary',
  shadowColor = 'primary',
  className = '',
  disabled = false,
  type = 'button',
  ...props
}) {
  const baseClasses =
    'px-8 py-3 text-lg font-semibold transition-all duration-200';

  // Define color mappings for Tailwind to detect
  const colorClasses = {
    primary: {
      bg: 'bg-primary-500',
      text: 'text-primary-600',
      textWhite: 'text-white',
      border: 'border-primary-500',
      borderOpacity: 'border-primary-500/20',
      shadow: 'shadow-primary-600',
      shadowHover: 'hover:shadow-primary-600',
      darkText: 'dark:text-primary-400',
    },
    secondary: {
      bg: 'bg-secondary-500',
      text: 'text-secondary-600',
      textWhite: 'text-white',
      border: 'border-secondary-500',
      borderOpacity: 'border-secondary-500/20',
      shadow: 'shadow-secondary-600',
      shadowHover: 'hover:shadow-secondary-600',
      darkText: 'dark:text-secondary-400',
    },
    blue: {
      bg: 'bg-blue-500',
      text: 'text-blue-600',
      textWhite: 'text-white',
      border: 'border-blue-500',
      borderOpacity: 'border-blue-500/20',
      shadow: 'shadow-blue-600',
      shadowHover: 'hover:shadow-blue-600',
      darkText: 'dark:text-blue-400',
    },
    red: {
      bg: 'bg-red-500',
      text: 'text-red-600',
      textWhite: 'text-white',
      border: 'border-red-500',
      borderOpacity: 'border-red-500/20',
      shadow: 'shadow-red-600',
      shadowHover: 'hover:shadow-red-600',
      darkText: 'dark:text-red-400',
    },
    green: {
      bg: 'bg-green-500',
      text: 'text-green-600',
      textWhite: 'text-white',
      border: 'border-green-500',
      borderOpacity: 'border-green-500/20',
      shadow: 'shadow-green-600',
      shadowHover: 'hover:shadow-green-600',
      darkText: 'dark:text-green-400',
    },
  };

  const shadowColorClasses = {
    primary: {
      shadow: 'shadow-primary-600',
      shadowHover: 'hover:shadow-primary-600',
      shadowSecondary: 'shadow-primary-500',
    },
    secondary: {
      shadow: 'shadow-secondary-600',
      shadowHover: 'hover:shadow-secondary-600',
      shadowSecondary: 'shadow-secondary-500',
    },
    blue: {
      shadow: 'shadow-blue-600',
      shadowHover: 'hover:shadow-blue-600',
      shadowSecondary: 'shadow-blue-500',
    },
    red: {
      shadow: 'shadow-red-600',
      shadowHover: 'hover:shadow-red-600',
      shadowSecondary: 'shadow-red-500',
    },
    green: {
      shadow: 'shadow-green-600',
      shadowHover: 'hover:shadow-green-600',
      shadowSecondary: 'shadow-green-500',
    },
  };

  const currentColor = colorClasses[color] || colorClasses.primary;
  const currentShadow =
    shadowColorClasses[shadowColor] || shadowColorClasses.primary;

  const variantClasses = {
    primary: `${currentColor.textWhite} ${currentColor.bg} border-2 ${currentColor.borderOpacity} shadow-[4px_4px_0px_0px] ${currentShadow.shadow} hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px] ${currentShadow.shadowHover} active:translate-x-[4px] active:translate-y-[4px] active:shadow-none`,
    secondary: `${currentColor.text} bg-white dark:bg-secondary-800 ${currentColor.darkText} border-2 ${currentColor.border} shadow-[4px_4px_0px_0px] ${currentShadow.shadowSecondary} hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none`,
    outline: `${currentColor.text} bg-transparent ${currentColor.darkText} border-2 ${currentColor.border} shadow-[4px_4px_0px_0px] ${currentShadow.shadowSecondary} hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none`,
  };

  const disabledClasses = disabled
    ? 'opacity-50 cursor-not-allowed hover:translate-x-0 hover:translate-y-0 hover:shadow-[4px_4px_0px_0px] active:translate-x-0 active:translate-y-0'
    : '';

  const combinedClasses =
    `${baseClasses} ${variantClasses[variant]} ${disabledClasses} ${className}`.trim();

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedClasses}
      {...props}
    >
      {children}
    </button>
  );
}

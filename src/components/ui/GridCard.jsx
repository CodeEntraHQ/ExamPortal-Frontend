export default function GridCard({
  children,
  onClick,
  className = '',
  shadowColor = 'primary',
  disabled = false,
  ...props
}) {
  const baseClasses = 'p-6 border-2 transition-all duration-200 cursor-pointer';

  const shadowColorClasses = {
    primary: {
      shadow: 'shadow-primary-600',
      shadowHover: 'hover:shadow-primary-600',
      shadowSecondary: 'shadow-primary-500',
      border: 'border-primary-500/20',
    },
    secondary: {
      shadow: 'shadow-secondary-600',
      shadowHover: 'hover:shadow-secondary-600',
      shadowSecondary: 'shadow-secondary-500',
      border: 'border-secondary-500/20',
    },
    blue: {
      shadow: 'shadow-blue-600',
      shadowHover: 'hover:shadow-blue-600',
      shadowSecondary: 'shadow-blue-500',
      border: 'border-blue-500/20',
    },
    red: {
      shadow: 'shadow-red-600',
      shadowHover: 'hover:shadow-red-600',
      shadowSecondary: 'shadow-red-500',
      border: 'border-red-500/20',
    },
    green: {
      shadow: 'shadow-green-600',
      shadowHover: 'hover:shadow-green-600',
      shadowSecondary: 'shadow-green-500',
      border: 'border-green-500/20',
    },
    gray: {
      shadow: 'shadow-gray-600',
      shadowHover: 'hover:shadow-gray-600',
      shadowSecondary: 'shadow-gray-500',
      border: 'border-gray-500/20',
    },
  };

  const currentShadow =
    shadowColorClasses[shadowColor] || shadowColorClasses.primary;

  const normalClasses = `bg-white dark:bg-secondary-800 ${currentShadow.border} shadow-[4px_4px_0px_0px] ${currentShadow.shadow} hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px] ${currentShadow.shadowHover} active:translate-x-[4px] active:translate-y-[4px] active:shadow-none`;

  const disabledClasses = disabled
    ? 'opacity-50 cursor-not-allowed hover:translate-x-0 hover:translate-y-0 hover:shadow-[4px_4px_0px_0px] active:translate-x-0 active:translate-y-0'
    : '';

  const combinedClasses =
    `${baseClasses} ${normalClasses} ${disabledClasses} ${className}`.trim();

  return (
    <div onClick={onClick} className={combinedClasses} {...props}>
      {children}
    </div>
  );
}

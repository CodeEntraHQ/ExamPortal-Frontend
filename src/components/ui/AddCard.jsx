export default function AddCard({
  title = 'Add New',
  description = 'Click to add a new item',
  onClick,
  shadowColor = 'primary',
  className = '',
  ...props
}) {
  const shadowColorClasses = {
    primary: {
      border: 'border-primary-500/20 dark:border-primary-400/20',
      shadow: 'shadow-primary-600 dark:shadow-primary-400',
      shadowHover: 'hover:shadow-primary-600 dark:hover:shadow-primary-400',
      iconBg: 'bg-primary-100 dark:bg-primary-900/30',
      iconText: 'text-primary-600 dark:text-primary-400',
    },
    green: {
      border: 'border-green-500/20 dark:border-green-400/20',
      shadow: 'shadow-green-600 dark:shadow-green-400',
      shadowHover: 'hover:shadow-green-600 dark:hover:shadow-green-400',
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconText: 'text-green-600 dark:text-green-400',
    },
    blue: {
      border: 'border-blue-500/20 dark:border-blue-400/20',
      shadow: 'shadow-blue-600 dark:shadow-blue-400',
      shadowHover: 'hover:shadow-blue-600 dark:hover:shadow-blue-400',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconText: 'text-blue-600 dark:text-blue-400',
    },
  };

  const currentShadow =
    shadowColorClasses[shadowColor] || shadowColorClasses.primary;

  return (
    <div
      onClick={onClick}
      className={`
        p-6 border-2 transition-all duration-200 cursor-pointer
        bg-white dark:bg-secondary-800
        ${currentShadow.border}
        shadow-[4px_4px_0px_0px] ${currentShadow.shadow}
        hover:translate-x-[2px] hover:translate-y-[2px] 
        hover:shadow-[2px_2px_0px_0px] ${currentShadow.shadowHover}
        active:translate-x-[4px] active:translate-y-[4px] active:shadow-none
        border-dashed
        ${className}
      `.trim()}
      {...props}
    >
      <div className='flex flex-col items-center justify-center h-full min-h-[120px] text-center'>
        <div
          className={`flex items-center justify-center w-12 h-12 mb-4 rounded-full ${currentShadow.iconBg}`}
        >
          <svg
            className={`w-6 h-6 ${currentShadow.iconText}`}
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 4v16m8-8H4'
            />
          </svg>
        </div>
        <h3 className='mb-2 text-lg font-semibold text-secondary-900 dark:text-secondary-50'>
          {title}
        </h3>
        <p className='text-sm text-secondary-600 dark:text-secondary-300'>
          {description}
        </p>
      </div>
    </div>
  );
}

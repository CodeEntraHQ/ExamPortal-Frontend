export default function EntityCard({
  entity,
  onClick,
  className = '',
  ...props
}) {
  if (!entity) return null;

  return (
    <div
      className={`
        relative p-6 border-2 transition-all duration-200 cursor-pointer
        bg-white dark:bg-secondary-800
        border-green-500/20 dark:border-green-400/20
        shadow-[4px_4px_0px_0px] shadow-green-600 dark:shadow-green-400
        hover:translate-x-[2px] hover:translate-y-[2px] 
        hover:shadow-[2px_2px_0px_0px] hover:shadow-green-600 dark:hover:shadow-green-400
        active:translate-x-[4px] active:translate-y-[4px] active:shadow-none
        ${className}
      `.trim()}
      {...props}
    >
      <button
        onClick={e => {
          e.stopPropagation();
          onClick();
        }}
        className='absolute bottom-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
        aria-label='Edit entity'
      >
        <svg
          className='w-5 h-5'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z'
          />
        </svg>
      </button>
      <div className='flex items-start justify-between mb-4'>
        <div className='flex items-center gap-3'>
          <div className='flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg dark:bg-green-900/30'>
            <svg
              className='w-5 h-5 text-green-600 dark:text-green-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
              />
            </svg>
          </div>
          <div>
            <h3 className='text-lg font-semibold text-secondary-900 dark:text-secondary-50'>
              {entity.name}
            </h3>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <span className='px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full dark:bg-green-900/30 dark:text-green-400'>
            ACTIVE
          </span>
        </div>
      </div>

      <div className='space-y-2'>
        <div className='flex items-center gap-2 text-sm text-secondary-600 dark:text-secondary-300'>
          <svg
            className='w-4 h-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
            />
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
            />
          </svg>
          <span>{entity.address || 'Address not provided'}</span>
        </div>

        {entity.created_at && (
          <div className='flex items-center gap-2 text-sm text-secondary-500 dark:text-secondary-400'>
            <svg
              className='w-4 h-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
              />
            </svg>
            <span>
              Created {new Date(entity.created_at).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

import React from 'react';

const ErrorPane = ({ message, onClose }) => {
  if (!message) {
    return null;
  }

  return (
    <div className='fixed bottom-4 right-4 w-80 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-6 rounded-xl shadow-2xl z-50 backdrop-blur-xl'>
      <div className='flex justify-between items-start'>
        <div className='flex items-center'>
          <svg
            className='w-8 h-8 text-red-500 mr-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
            ></path>
          </svg>
          <div>
            <p className='text-md mt-1'>{message}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className='ml-4 text-red-600 hover:text-red-800 dark:text-red-300 dark:hover:text-red-100 transition-colors duration-200'
        >
          <span className='text-3xl font-light'>&times;</span>
        </button>
      </div>
    </div>
  );
};

export default ErrorPane;

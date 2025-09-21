import React from 'react';

const SuccessPane = ({ message, onClose }) => {
  if (!message) {
    return null;
  }

  return (
    <div className='fixed bottom-4 right-4 w-80 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 p-6 rounded-xl shadow-2xl z-50 backdrop-blur-xl'>
      <div className='flex justify-between items-start'>
        <div className='flex items-center'>
          <svg
            className='w-8 h-8 text-green-500 mr-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
            ></path>
          </svg>
          <div>
            <p className='text-md mt-1'>{message}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className='ml-4 text-green-600 hover:text-green-800 dark:text-green-300 dark:hover:text-green-100 transition-colors duration-200'
        >
          <span className='text-3xl font-light'>&times;</span>
        </button>
      </div>
    </div>
  );
};

export default SuccessPane;

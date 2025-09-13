import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className='min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center'>
              <h1 className='text-2xl font-bold text-primary-600'>
                ExamPortal
              </h1>
            </div>
            <nav className='hidden md:flex space-x-8'>
              <a
                href='#'
                className='text-gray-700 hover:text-primary-600 transition-colors duration-200'
              >
                Dashboard
              </a>
              <a
                href='#'
                className='text-gray-700 hover:text-primary-600 transition-colors duration-200'
              >
                Exams
              </a>
              <a
                href='#'
                className='text-gray-700 hover:text-primary-600 transition-colors duration-200'
              >
                Results
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='text-center mb-12'>
          <h2 className='text-4xl font-bold text-gray-900 mb-4'>
            Welcome to ExamPortal
          </h2>
          <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
            A modern platform for conducting and managing online examinations
            with ease and efficiency.
          </p>
        </div>

        {/* Feature Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-12'>
          <div className='card hover:shadow-lg transition-shadow duration-300'>
            <div className='text-center'>
              <div className='w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <svg
                  className='w-8 h-8 text-primary-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                  />
                </svg>
              </div>
              <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                Create Exams
              </h3>
              <p className='text-gray-600'>
                Easily create and configure online examinations with various
                question types.
              </p>
            </div>
          </div>

          <div className='card hover:shadow-lg transition-shadow duration-300'>
            <div className='text-center'>
              <div className='w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <svg
                  className='w-8 h-8 text-secondary-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
                  />
                </svg>
              </div>
              <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                Manage Students
              </h3>
              <p className='text-gray-600'>
                Invite and manage students, track their progress and
                performance.
              </p>
            </div>
          </div>

          <div className='card hover:shadow-lg transition-shadow duration-300'>
            <div className='text-center'>
              <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <svg
                  className='w-8 h-8 text-green-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                  />
                </svg>
              </div>
              <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                View Analytics
              </h3>
              <p className='text-gray-600'>
                Get detailed insights and analytics on exam performance and
                student progress.
              </p>
            </div>
          </div>
        </div>

        {/* Demo Section */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-8'>
          <div className='text-center'>
            <h3 className='text-2xl font-semibold text-gray-900 mb-4'>
              Demo Counter
            </h3>
            <div className='mb-6'>
              <span className='text-6xl font-bold text-primary-600'>
                {count}
              </span>
            </div>
            <div className='flex justify-center space-x-4'>
              <button
                onClick={() => setCount(count - 1)}
                className='btn-secondary'
              >
                Decrease
              </button>
              <button
                onClick={() => setCount(count + 1)}
                className='btn-primary'
              >
                Increase
              </button>
              <button
                onClick={() => setCount(0)}
                className='bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
              >
                Reset
              </button>
            </div>
            <p className='text-gray-600 mt-4'>
              This demonstrates Tailwind CSS styling and React state management.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className='bg-white border-t border-gray-200 mt-16'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <div className='text-center text-gray-600'>
            <p>
              &copy; 2024 ExamPortal. Built with React, Vite, and Tailwind CSS.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

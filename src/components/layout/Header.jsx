import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks';
import ThemeToggle from '../ui/ThemeToggle';
import ProfileDropdown from '../ui/ProfileDropdown';

export default function Header({ openLoginModal }) {
  const { isAuthenticated } = useAuth();
  return (
    <header className='fixed top-0 inset-x-0 bg-white/90 dark:bg-secondary-900/70 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-secondary-900/60 border-b-2 border-primary-200 dark:border-secondary-800 z-40 shadow-sm'>
      <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          <Link
            to={isAuthenticated ? '/dashboard/superadmin' : '/'}
            className='flex items-center gap-2'
          >
            <div className='flex items-center justify-center w-8 h-8 rounded-lg shadow-sm bg-primary-500'>
              <span className='font-bold text-white'>E</span>
            </div>
            <span className='text-xl font-bold text-primary-700 dark:text-primary-400'>
              ExamEntra
            </span>
          </Link>
          <div className='flex-1 flex justify-center px-2 lg:ml-6 lg:justify-end'>
            <div className='max-w-md w-full lg:max-w-xs'>
              <label htmlFor='search' className='sr-only'>
                Search
              </label>
              <div className='relative'>
                <div className='pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center'>
                  <svg
                    className='h-5 w-5 text-gray-400'
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                    aria-hidden='true'
                  >
                    <path
                      fillRule='evenodd'
                      d='M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
                <input
                  id='search'
                  name='search'
                  className='block w-full bg-secondary-100 dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 rounded-md py-2 pl-10 pr-3 text-sm placeholder-secondary-500 dark:placeholder-secondary-400 focus:outline-none focus:text-secondary-900 dark:focus:text-white focus:placeholder-secondary-400 dark:focus:placeholder-secondary-500 focus:ring-1 focus:ring-primary-500 dark:focus:ring-primary-500 focus:border-primary-500 dark:focus:border-primary-500 sm:text-sm'
                  placeholder='Search for exams'
                  type='search'
                />
              </div>
            </div>
          </div>
          <div className='flex items-center gap-3 ml-4'>
            <ThemeToggle />
            {isAuthenticated ? (
              <ProfileDropdown />
            ) : (
              <button
                onClick={openLoginModal}
                className='inline-block bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition'
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

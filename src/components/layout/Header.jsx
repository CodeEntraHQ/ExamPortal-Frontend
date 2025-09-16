import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks';
import ThemeToggle from '../ui/ThemeToggle';
import ProfileDropdown from '../ui/ProfileDropdown';
import defaultProfile from '../../assets/default-profile.svg';

export default function Header() {
  const { isAuthenticated } = useAuth();
  return (
    <header className='fixed top-0 inset-x-0 bg-white/90 dark:bg-secondary-900/70 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-secondary-900/60 border-b-2 border-primary-200 dark:border-secondary-800 z-40 shadow-sm'>
      <div className='w-full px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          <Link to='/' className='flex items-center gap-2'>
            <div className='flex items-center justify-center w-8 h-8 rounded-lg shadow-sm bg-primary-500'>
              <span className='font-bold text-white'>E</span>
            </div>
            <span className='text-xl font-bold text-primary-700 dark:text-primary-400'>
              ExamEntra
            </span>
          </Link>
          <div className='flex items-center gap-3'>
            <ThemeToggle />
            {isAuthenticated ? (
              <ProfileDropdown />
            ) : (
              <Link
                to='/login'
                className='flex items-center justify-center w-10 h-10 transition-colors rounded-full bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 dark:hover:bg-secondary-700'
                aria-label='User account'
              >
                <img
                  src={defaultProfile}
                  alt='User profile'
                  className='w-8 h-8 rounded-full'
                />
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

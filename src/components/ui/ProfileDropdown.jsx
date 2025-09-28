import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks';
import defaultProfile from '../../assets/default-profile.svg';
import avatar1 from '../../assets/profile-avatar-1.svg';
import avatar2 from '../../assets/profile-avatar-2.svg';
import avatar3 from '../../assets/profile-avatar-3.svg';
import avatar4 from '../../assets/profile-avatar-4.svg';
import avatar5 from '../../assets/profile-avatar-5.svg';

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout } = useAuth();

  // Select a random avatar based on user ID for consistency
  const avatars = [defaultProfile, avatar1, avatar2, avatar3, avatar4, avatar5];
  const selectedAvatar =
    avatars[user?.id ? user.id.charCodeAt(0) % avatars.length : 0];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <div className='relative' ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center justify-center w-10 h-10 transition-colors rounded-full bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 dark:hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-secondary-900'
        aria-label='User profile menu'
      >
        <img
          src={user?.profile_picture || selectedAvatar || defaultProfile}
          alt='User profile'
          className='w-8 h-8 rounded-full'
        />
      </button>

      {isOpen && (
        <div className='absolute right-0 z-50 w-56 mt-2 bg-white border rounded-lg shadow-lg dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700'>
          <div className='px-4 py-3 border-b border-secondary-200 dark:border-secondary-700'>
            <p className='text-sm font-medium text-secondary-900 dark:text-secondary-100'>
              {user?.name}
            </p>
            <p className='text-sm capitalize text-secondary-500 dark:text-secondary-400'>
              {user?.role}
            </p>
          </div>

          <div className='py-1'>
            <Link
              to='/profile'
              className='flex items-center px-4 py-2 text-sm transition-colors text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700'
              onClick={() => setIsOpen(false)}
            >
              <svg
                className='w-4 h-4 mr-3'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                />
              </svg>
              Profile
            </Link>

            <Link
              to='/settings'
              className='flex items-center px-4 py-2 text-sm transition-colors text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700'
              onClick={() => setIsOpen(false)}
            >
              <svg
                className='w-4 h-4 mr-3'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
                />
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                />
              </svg>
              Settings
            </Link>
          </div>

          <div className='py-1 border-t border-secondary-200 dark:border-secondary-700'>
            <button
              onClick={handleLogout}
              className='flex items-center w-full px-4 py-2 text-sm text-red-600 transition-colors dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
            >
              <svg
                className='w-4 h-4 mr-3'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
                />
              </svg>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

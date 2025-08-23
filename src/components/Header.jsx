import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import CollegeIcon from './CollegeIcon.jsx';
import profileDefault from '../assets/profile-default.svg';
import profileLogin from '../assets/profile-login.svg';
import { useAuth } from '../hooks/useAuth';

export default function Header() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  const handleLogout = () => {
    logout();
    // Add a small delay to ensure the user state is cleared before navigation
    setTimeout(() => {
      navigate('/');
    }, 50);
  };

  return (
    <header className="grid items-center h-16 grid-cols-3 px-8 border-b shadow-lg bg-white/80 backdrop-blur-sm border-indigo-50 shadow-indigo-100/20">
      <div className="flex items-center gap-2 group">
        <Link
          to={user ? (user.role === 'ADMIN' ? '/admin' : '/student') : '/'}
          className="transition-transform duration-300 ease-out group-hover:scale-110"
        >
          <CollegeIcon />
        </Link>
      </div>
      <div className="flex justify-center">
        <Link
          to={user ? (user.role === 'ADMIN' ? '/admin' : '/student') : '/'}
          className="text-xl font-bold text-transparent transition-all duration-300 ease-in-out bg-gradient-to-r from-primary to-indigo-600 bg-clip-text hover:from-indigo-600 hover:to-primary"
        >
          ExamEntra
        </Link>
      </div>
      <div className="flex justify-end">
        {!user ? (
          <Link
            to="/login"
            className="flex items-center justify-center w-10 h-10 transition-all duration-300 ease-in-out rounded-full hover:bg-indigo-50 group"
          >
            <img
              src={profileDefault}
              alt="Profile"
              className="w-8 h-8 transition-all duration-300 ease-out group-hover:scale-110 group-hover:rotate-6"
            />
          </Link>
        ) : (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center justify-center w-10 h-10 transition-all duration-300 ease-in-out rounded-full hover:bg-indigo-50 group"
            >
              <img
                src={profileLogin}
                alt="Profile"
                className="w-8 h-8 transition-all duration-300 ease-out group-hover:scale-110 group-hover:rotate-6"
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 z-10 w-48 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

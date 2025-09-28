import { useState, useEffect, useRef } from 'react';
import { useAuth, useNotification } from '../../hooks';
import { getCaptcha } from '../../services/captchaService';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Label from '../ui/Label';

// SVG Icon Components
const EyeIcon = ({ className }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 20 20'
    fill='currentColor'
    className={className}
  >
    <path d='M10 12a2 2 0 100-4 2 2 0 000 4z' />
    <path
      fillRule='evenodd'
      d='M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z'
      clipRule='evenodd'
    />
  </svg>
);

const EyeOffIcon = ({ className }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 20 20'
    fill='currentColor'
    className={className}
  >
    <path
      fillRule='evenodd'
      d='M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zM14.95 14.95a10.05 10.05 0 01-1.922 1.506l-1.414-1.414a8.06 8.06 0 00-1.178-1.178l-1.414-1.414a5.983 5.983 0 00-1.506-1.922l-1.414-1.414A8.06 8.06 0 006.47 6.47L5.056 5.056A10.05 10.05 0 0110 4.46c4.478 0 8.268 2.943 9.542 7a10.014 10.014 0 01-4.592 5.542z'
      clipRule='evenodd'
    />
    <path d='M10 12a2 2 0 100-4 2 2 0 000 4z' />
  </svg>
);

export default function LoginModal({
  isOpen,
  onClose,
  onSwitchToForgotPassword,
}) {
  const { login, loading } = useAuth();
  const { addError } = useNotification();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    captcha: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaData, setCaptchaData] = useState(null);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const modalRef = useRef(null);

  const fetchCaptcha = async () => {
    try {
      const { captchaData, captchaToken } = await getCaptcha();
      setCaptchaData(captchaData);
      setCaptchaToken(captchaToken);
    } catch {
      addError('Failed to load captcha. Please refresh the page.');
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCaptcha();
    }
  }, [isOpen]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await login(
      formData.email,
      formData.password,
      formData.captcha,
      captchaToken
    );
    if (!result.success) {
      addError(result.error);
      fetchCaptcha(); // Refresh captcha on failed login
    } else {
      onClose(); // Close modal on successful login
    }
    setIsSubmitting(false);
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = e => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Handle clicking outside modal to close
  useEffect(() => {
    const handleClickOutside = e => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm'>
      <div
        ref={modalRef}
        className='w-full max-w-md p-8 space-y-8 bg-white dark:bg-secondary-800 rounded-2xl shadow-2xl border-2 border-primary-200 dark:border-secondary-600'
      >
        <div className='text-center'>
          <h2 className='text-3xl font-extrabold text-gray-900 dark:text-white'>
            Welcome Back
          </h2>
          <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
            Login to your account to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          <div>
            <Label htmlFor='email'>Email address</Label>
            <Input
              id='email'
              name='email'
              type='email'
              autoComplete='email'
              required
              value={formData.email}
              onChange={handleChange}
              placeholder='you@example.com'
            />
          </div>

          <div className='space-y-1'>
            <Label htmlFor='password'>Password</Label>
            <div className='relative'>
              <Input
                id='password'
                name='password'
                type={showPassword ? 'text' : 'password'}
                autoComplete='current-password'
                required
                value={formData.password}
                onChange={handleChange}
                placeholder='Your password'
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-500'
              >
                {showPassword ? (
                  <EyeOffIcon className='w-5 h-5' />
                ) : (
                  <EyeIcon className='w-5 h-5' />
                )}
              </button>
            </div>
          </div>

          <div className='space-y-1'>
            <Label htmlFor='captcha'>Captcha</Label>
            <div className='flex items-center space-x-4'>
              <div className='w-1/2 h-12 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center'>
                {captchaData ? (
                  <img
                    src={`data:image/svg+xml;base64,${captchaData}`}
                    alt='Captcha'
                    className='object-cover w-full h-full rounded-md'
                  />
                ) : (
                  <p className='text-xs text-gray-500'>Loading...</p>
                )}
              </div>
              <Input
                id='captcha'
                name='captcha'
                type='text'
                required
                value={formData.captcha}
                onChange={handleChange}
                placeholder='Enter text'
                className='flex-grow'
              />
            </div>
          </div>

          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <input
                id='remember-me'
                name='remember-me'
                type='checkbox'
                className='w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500'
              />
              <label
                htmlFor='remember-me'
                className='block ml-2 text-sm text-gray-900 dark:text-gray-300'
              >
                Remember me
              </label>
            </div>

            <div className='text-sm'>
              <button
                type='button'
                onClick={onSwitchToForgotPassword}
                className='font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300'
              >
                Forgot your password?
              </button>
            </div>
          </div>

          <div className='flex items-center space-x-4'>
            <Button
              type='button'
              onClick={onClose}
              className='flex justify-center w-full px-4 py-3 text-sm font-medium text-gray-700 bg-gray-200 border border-transparent rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
            >
              Cancel
            </Button>
            <Button
              type='submit'
              className='flex justify-center w-full px-4 py-3 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
              disabled={isSubmitting || loading}
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

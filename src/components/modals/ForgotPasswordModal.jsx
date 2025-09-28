import { useState, useRef, useEffect } from 'react';
import { useNotification } from '../../hooks';
import { userService } from '../../services';
import { Button, Input, Label } from '../ui';

export default function ForgotPasswordModal({
  isOpen,
  onClose,
  onSwitchToLogin,
}) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addSuccess, addError } = useNotification();
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = e => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

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

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await userService.forgotPassword(email);
      if (response.status === 'SUCCESS') {
        addSuccess('Password reset link sent to your email.');
        setEmail('');
        onClose();
      } else {
        addError(
          response.responseMessage || 'Failed to send password reset link.'
        );
      }
    } catch (error) {
      addError(error.message || 'Failed to send password reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm'>
      <div
        ref={modalRef}
        className='w-full max-w-md p-8 space-y-8 bg-white dark:bg-secondary-800 rounded-2xl shadow-2xl border-2 border-primary-200 dark:border-secondary-600'
      >
        <div className='text-center'>
          <h2 className='text-3xl font-extrabold text-gray-900 dark:text-white'>
            Forgot Password
          </h2>
          <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
            Enter your email to receive a reset link.
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
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder='you@example.com'
            />
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
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Link'}
            </Button>
          </div>
        </form>
        <div className='text-sm text-center'>
          <button
            onClick={onSwitchToLogin}
            className='font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300'
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

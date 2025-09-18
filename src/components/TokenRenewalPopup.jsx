import { useState, useEffect, useCallback } from 'react';
import Button from './ui/Button';

/**
 * Persistent popup for token renewal when user is inactive
 * @param {boolean} isVisible - Whether the popup is visible
 * @param {number} timeRemaining - Time remaining in milliseconds
 * @param {function} onRenew - Callback when user chooses to renew
 * @param {function} onLogout - Callback when user chooses to logout
 * @param {function} onDismiss - Callback when user dismisses the popup
 */
export const TokenRenewalPopup = ({
  isVisible,
  timeRemaining,
  onRenew,
  onLogout,
  onDismiss,
}) => {
  const [countdown, setCountdown] = useState(0);
  const [isRenewing, setIsRenewing] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    setCountdown(Math.ceil(timeRemaining / 1000));

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          // Use setTimeout to avoid setState during render
          setTimeout(() => {
            onLogout();
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible, timeRemaining, onLogout]);

  const handleRenew = useCallback(async () => {
    setIsRenewing(true);
    try {
      await onRenew();
      onDismiss();
    } catch (error) {
      console.error('Token renewal failed:', error);
    } finally {
      setIsRenewing(false);
    }
  }, [onRenew, onDismiss]);

  const handleLogout = useCallback(() => {
    onLogout();
  }, [onLogout]);

  if (!isVisible) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50'>
      <div className='bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-lg w-full mx-6 border-2 border-gray-200 dark:border-gray-700'>
        <div className='text-center'>
          {/* Title */}
          <h3 className='text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4'>
            Session Expiring
          </h3>

          {/* Timer Display */}
          <div className='mb-6'>
            <div className='text-4xl font-bold text-yellow-600 dark:text-yellow-400 mb-2'>
              {countdown}
            </div>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              seconds remaining
            </p>
          </div>

          {/* Action Buttons */}
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Button
              onClick={handleRenew}
              disabled={isRenewing}
              variant='primary'
              className='text-lg'
            >
              {isRenewing ? 'Renewing...' : 'Renew Session'}
            </Button>

            <Button
              onClick={handleLogout}
              variant='secondary'
              color='red'
              shadowColor='red'
              className='text-lg'
            >
              Logout
            </Button>
          </div>

          {/* Auto logout warning */}
          <p className='text-xs text-gray-500 dark:text-gray-400 mt-6'>
            You will be logged out automatically if no action is taken.
          </p>
        </div>
      </div>
    </div>
  );
};

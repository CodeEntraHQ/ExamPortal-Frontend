import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNotification } from '../hooks';
import { userService } from '../services';
import { Input, Label } from '../components/ui';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState(null);
  const { addSuccess, addError } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      addError('Invalid password reset link.');
      navigate('/');
    }
  }, [location, addError, navigate]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (password !== confirmPassword) {
      addError('Passwords do not match.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await userService.resetPassword(token, password);
      if (response.status === 'SUCCESS') {
        addSuccess('Password has been reset successfully.');
        navigate('/');
      } else {
        addError(response.responseMessage || 'Failed to reset password.');
      }
    } catch (error) {
      addError(error.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex justify-center py-16'>
      <div className='w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md dark:bg-secondary-800'>
        <div>
          <h2 className='text-3xl font-extrabold text-center text-gray-900 dark:text-white'>
            Reset Your Password
          </h2>
        </div>
        <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
          <div>
            <Label htmlFor='password'>New Password</Label>
            <Input
              id='password'
              name='password'
              type='password'
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder='New Password'
            />
          </div>
          <div>
            <Label htmlFor='confirmPassword'>Confirm New Password</Label>
            <Input
              id='confirmPassword'
              name='confirmPassword'
              type='password'
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder='Confirm New Password'
            />
          </div>
          <div>
            <button
              type='submit'
              className='w-full inline-block bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition'
              disabled={isLoading}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

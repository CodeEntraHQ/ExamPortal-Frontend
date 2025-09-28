import { useState } from 'react';
import { useAuth, useNotification } from '../hooks';
import { authService } from '../services';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Label from '../components/ui/Label';

export default function Settings() {
  const { user } = useAuth();
  const { addSuccess, addError } = useNotification();
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordChange = async e => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.target);
    const oldPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');

    if (newPassword !== confirmPassword) {
      addError('New passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.changePassword(
        oldPassword,
        newPassword
      );
      if (response.status === 'SUCCESS') {
        addSuccess('Password changed successfully!');
        e.target.reset();
      } else {
        addError(
          response.responseMessage ||
            'Failed to change password. Please try again.'
        );
      }
    } catch (error) {
      addError(error.message || 'Failed to change password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-[calc(100vh-4rem)] p-8 pb-20'>
      <div className='mx-auto max-w-7xl'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-secondary-900 dark:text-secondary-50'>
            Settings
          </h1>
          <p className='mt-2 text-secondary-600 dark:text-secondary-300'>
            Manage your account settings and preferences
          </p>
        </div>

        <div className='grid grid-cols-1 gap-6 mb-6 lg:grid-cols-2'>
          <Card>
            <h3 className='mb-4 text-lg font-semibold text-secondary-900 dark:text-secondary-50'>
              Change Password
            </h3>
            <form onSubmit={handlePasswordChange} className='space-y-4'>
              <div>
                <Label htmlFor='currentPassword'>Current Password</Label>
                <Input
                  id='currentPassword'
                  name='currentPassword'
                  type='password'
                  required
                />
              </div>

              <div>
                <Label htmlFor='newPassword'>New Password</Label>
                <Input
                  id='newPassword'
                  name='newPassword'
                  type='password'
                  required
                  minLength={8}
                />
              </div>

              <div>
                <Label htmlFor='confirmPassword'>Confirm New Password</Label>
                <Input
                  id='confirmPassword'
                  name='confirmPassword'
                  type='password'
                  required
                  minLength={8}
                />
              </div>

              <Button type='submit' disabled={isLoading} className='w-full'>
                {isLoading ? 'Changing Password...' : 'Change Password'}
              </Button>
            </form>
          </Card>

          <div className='space-y-6'>
            <Card>
              <h3 className='mb-4 text-lg font-semibold text-secondary-900 dark:text-secondary-50'>
                Account Information
              </h3>
              <div className='space-y-3'>
                <div className='flex items-center justify-between py-2'>
                  <span className='text-secondary-700 dark:text-secondary-300'>
                    User ID
                  </span>
                  <span className='font-mono text-sm text-secondary-900 dark:text-secondary-100'>
                    {user?.id || 'N/A'}
                  </span>
                </div>
                <div className='flex items-center justify-between py-2'>
                  <span className='text-secondary-700 dark:text-secondary-300'>
                    Account Type
                  </span>
                  <span className='capitalize text-secondary-900 dark:text-secondary-100'>
                    {user?.role || 'N/A'}
                  </span>
                </div>
                <div className='flex items-center justify-between py-2'>
                  <span className='text-secondary-700 dark:text-secondary-300'>
                    Member Since
                  </span>
                  <span className='text-secondary-900 dark:text-secondary-100'>
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : 'Unknown'}
                  </span>
                </div>
              </div>
            </Card>
            <Card>
              <h3 className='mb-4 text-lg font-semibold text-secondary-900 dark:text-secondary-50'>
                Danger Zone
              </h3>
              <div className='space-y-3'>
                <div className='p-4 border border-red-200 rounded-lg dark:border-red-800 bg-red-50 dark:bg-red-900/20'>
                  <h4 className='mb-2 font-medium text-red-800 dark:text-red-200'>
                    Delete Account
                  </h4>
                  <p className='mb-3 text-sm text-red-600 dark:text-red-300'>
                    Once you delete your account, there is no going back. Please
                    be certain.
                  </p>
                  <Button
                    color='red'
                    shadowColor='red'
                    onClick={() => {
                      if (
                        confirm(
                          'Are you sure you want to delete your account? This action cannot be undone.'
                        )
                      ) {
                        addError('Account deletion not implemented yet.');
                      }
                    }}
                    className='px-4 py-2 text-sm'
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

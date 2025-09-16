import { useAuth } from '../hooks';
import Card from '../components/ui/Card';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className='min-h-[calc(100vh-4rem)] p-8 pb-20'>
      <div className='max-w-4xl mx-auto'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-secondary-900 dark:text-secondary-50'>
            My Profile
          </h1>
          <p className='mt-2 text-secondary-600 dark:text-secondary-300'>
            View and manage your profile information
          </p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <div className='lg:col-span-1'>
            <Card>
              <div className='text-center'>
                <div className='w-24 h-24 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center'>
                  <span className='text-2xl font-bold text-primary-700 dark:text-primary-300'>
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <h3 className='text-lg font-semibold text-secondary-900 dark:text-secondary-50'>
                  {user?.name}
                </h3>
                <p className='text-sm text-secondary-500 dark:text-secondary-400 capitalize'>
                  {user?.role}
                </p>
              </div>
            </Card>
          </div>

          <div className='lg:col-span-2'>
            <Card>
              <h3 className='text-lg font-semibold text-secondary-900 dark:text-secondary-50 mb-4'>
                Profile Information
              </h3>
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1'>
                    Full Name
                  </label>
                  <p className='text-secondary-900 dark:text-secondary-100'>
                    {user?.name || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className='block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1'>
                    Email
                  </label>
                  <p className='text-secondary-900 dark:text-secondary-100'>
                    {user?.email || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className='block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1'>
                    Role
                  </label>
                  <p className='text-secondary-900 dark:text-secondary-100 capitalize'>
                    {user?.role || 'Not assigned'}
                  </p>
                </div>
                <div>
                  <label className='block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1'>
                    Member Since
                  </label>
                  <p className='text-secondary-900 dark:text-secondary-100'>
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : 'Unknown'}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
